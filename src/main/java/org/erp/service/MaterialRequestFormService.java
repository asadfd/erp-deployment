package org.erp.service;

import org.erp.entity.MaterialRequestForm;
import org.erp.entity.MRFItem;
import org.erp.repository.MaterialRequestFormRepository;
import org.erp.repository.MRFItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class MaterialRequestFormService {
    
    @Autowired
    private MaterialRequestFormRepository mrfRepository;
    
    @Autowired
    private MRFItemRepository mrfItemRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    public List<MaterialRequestForm> getAllMRFs() {
        return mrfRepository.findAll();
    }
    
    public Optional<MaterialRequestForm> getMRFById(Long id) {
        return mrfRepository.findById(id);
    }
    
    public Optional<MaterialRequestForm> getMRFByNumber(String mrfNumber) {
        return mrfRepository.findByMrfNumber(mrfNumber);
    }
    
    public List<MaterialRequestForm> getPendingMRFs() {
        return mrfRepository.findByStatus(MaterialRequestForm.MRFStatus.PENDING);
    }
    
    public List<MaterialRequestForm> getPendingMRFsForAdmin() {
        return mrfRepository.findByStatusAndRequiresSuperadmin(
            MaterialRequestForm.MRFStatus.PENDING, false);
    }
    
    public List<MaterialRequestForm> getPendingMRFsForSuperAdmin() {
        return mrfRepository.findByStatusAndRequiresSuperadmin(
            MaterialRequestForm.MRFStatus.PENDING, true);
    }
    
    public List<MaterialRequestForm> getUserMRFs(String username) {
        return mrfRepository.findByRequestedByOrderByCreationDateDesc(username);
    }
    
    public String generateMRFNumber() {
        Integer maxNumber = mrfRepository.findMaxMrfNumber();
        if (maxNumber == null) {
            maxNumber = 0;
        }
        return "MRF" + String.format("%04d", maxNumber + 1);
    }
    
    @Transactional
    public MaterialRequestForm createMRF(MaterialRequestForm mrf, String requestedBy) {
        mrf.setMrfNumber(generateMRFNumber());
        mrf.setRequestedBy(requestedBy);
        mrf.setCreationDate(LocalDateTime.now());
        mrf.setStatus(MaterialRequestForm.MRFStatus.PENDING);
        
        // Calculate total amount and determine approval level
        BigDecimal totalAmount = BigDecimal.ZERO;
        if (mrf.getItems() != null && !mrf.getItems().isEmpty()) {
            for (MRFItem item : mrf.getItems()) {
                item.calculateAmount();
                item.setMaterialRequestForm(mrf);
                totalAmount = totalAmount.add(item.getAmount());
            }
        }
        mrf.setTotalAmount(totalAmount);
        mrf.setRequiresSuperadmin(totalAmount.compareTo(new BigDecimal("2000")) >= 0);
        
        MaterialRequestForm savedMRF = mrfRepository.save(mrf);
        
        // For now, skip notification creation since it requires finding users by role
        // TODO: Implement notification for users with ADMIN/SUPER_ADMIN roles
        
        return savedMRF;
    }
    
    @Transactional
    public MaterialRequestForm updateMRF(Long id, MaterialRequestForm updatedMRF, String requestedBy) {
        Optional<MaterialRequestForm> existingMRFOpt = mrfRepository.findById(id);
        if (!existingMRFOpt.isPresent()) {
            throw new RuntimeException("MRF not found with ID: " + id);
        }
        
        MaterialRequestForm existingMRF = existingMRFOpt.get();
        
        // Only allow updates if MRF is still pending and user is the requester
        if (existingMRF.getStatus() != MaterialRequestForm.MRFStatus.PENDING) {
            throw new RuntimeException("Cannot update MRF that is not in pending status");
        }
        
        if (!existingMRF.getRequestedBy().equals(requestedBy)) {
            throw new RuntimeException("Only the original requester can update this MRF");
        }
        
        // Update fields
        existingMRF.setRequestorName(updatedMRF.getRequestorName());
        existingMRF.setRequestorDepartment(updatedMRF.getRequestorDepartment());
        existingMRF.setRequestorEmployeeId(updatedMRF.getRequestorEmployeeId());
        existingMRF.setReasonJustification(updatedMRF.getReasonJustification());
        
        // Clear existing items and add new ones
        existingMRF.getItems().clear();
        if (updatedMRF.getItems() != null) {
            for (MRFItem item : updatedMRF.getItems()) {
                item.setMaterialRequestForm(existingMRF);
                item.calculateAmount();
                existingMRF.addItem(item);
            }
        }
        
        // Recalculate total and approval level
        existingMRF.calculateTotalAndDetermineApprover();
        
        return mrfRepository.save(existingMRF);
    }
    
    @Transactional
    public void deleteMRF(Long id, String requestedBy) {
        Optional<MaterialRequestForm> mrfOpt = mrfRepository.findById(id);
        if (!mrfOpt.isPresent()) {
            throw new RuntimeException("MRF not found with ID: " + id);
        }
        
        MaterialRequestForm mrf = mrfOpt.get();
        
        // Only allow deletion if MRF is still pending and user is the requester
        if (mrf.getStatus() != MaterialRequestForm.MRFStatus.PENDING) {
            throw new RuntimeException("Cannot delete MRF that is not in pending status");
        }
        
        if (!mrf.getRequestedBy().equals(requestedBy)) {
            throw new RuntimeException("Only the original requester can delete this MRF");
        }
        
        mrfRepository.delete(mrf);
    }
    
    @Transactional
    public void approveMRF(Long id, String approvedBy) {
        Optional<MaterialRequestForm> mrfOpt = mrfRepository.findById(id);
        if (!mrfOpt.isPresent()) {
            throw new RuntimeException("MRF not found with ID: " + id);
        }
        
        MaterialRequestForm mrf = mrfOpt.get();
        
        if (mrf.getStatus() != MaterialRequestForm.MRFStatus.PENDING) {
            throw new RuntimeException("MRF is not in pending status");
        }
        
        mrf.setStatus(MaterialRequestForm.MRFStatus.APPROVED);
        mrf.setApprovedBy(approvedBy);
        mrf.setApprovalDate(LocalDateTime.now());
        
        mrfRepository.save(mrf);
        
        // Send notification to requester
        String message = String.format("Your MRF %s has been approved by %s.", 
                mrf.getMrfNumber(), approvedBy);
        notificationService.createNotification(mrf.getRequestedBy(), message);
    }
    
    @Transactional
    public void rejectMRF(Long id, String rejectedBy, String reason) {
        Optional<MaterialRequestForm> mrfOpt = mrfRepository.findById(id);
        if (!mrfOpt.isPresent()) {
            throw new RuntimeException("MRF not found with ID: " + id);
        }
        
        MaterialRequestForm mrf = mrfOpt.get();
        
        if (mrf.getStatus() != MaterialRequestForm.MRFStatus.PENDING) {
            throw new RuntimeException("MRF is not in pending status");
        }
        
        mrf.setStatus(MaterialRequestForm.MRFStatus.REJECTED);
        mrf.setApprovedBy(rejectedBy);
        mrf.setApprovalDate(LocalDateTime.now());
        mrf.setRejectionReason(reason);
        
        mrfRepository.save(mrf);
        
        // Send notification to requester
        String message = String.format("Your MRF %s has been rejected by %s. Reason: %s", 
                mrf.getMrfNumber(), rejectedBy, reason);
        notificationService.createNotification(mrf.getRequestedBy(), message);
    }
}