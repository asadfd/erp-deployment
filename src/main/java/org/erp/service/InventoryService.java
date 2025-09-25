package org.erp.service;

import org.erp.entity.Inventory;
import org.erp.entity.InventoryRequest;
import org.erp.repository.InventoryRepository;
import org.erp.repository.InventoryRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class InventoryService {
    
    @Autowired
    private InventoryRepository inventoryRepository;
    
    @Autowired
    private InventoryRequestRepository inventoryRequestRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }
    
    public Optional<Inventory> getInventoryByInventoryId(String inventoryId) {
        return inventoryRepository.findByInventoryId(inventoryId);
    }
    
    public String generateInventoryId() {
        Integer maxNumber = inventoryRepository.findMaxInventoryNumber();
        if (maxNumber == null) {
            maxNumber = 0;
        }
        return "INV" + String.format("%04d", maxNumber + 1);
    }
    
    // Request-based operations (require approval)
    public InventoryRequest submitCreateRequest(InventoryRequest request, String requestedBy) {
        request.setRequestType(InventoryRequest.RequestType.CREATE);
        request.setRequestedBy(requestedBy);
        request.setRequestDate(LocalDateTime.now());
        request.setStatus(InventoryRequest.RequestStatus.PENDING);
        request.setInventoryId(generateInventoryId());
        
        return inventoryRequestRepository.save(request);
    }
    
    public InventoryRequest submitUpdateRequest(String inventoryId, InventoryRequest request, String requestedBy) {
        Optional<Inventory> existingInventory = inventoryRepository.findByInventoryId(inventoryId);
        if (!existingInventory.isPresent()) {
            throw new RuntimeException("Inventory not found with ID: " + inventoryId);
        }
        
        request.setRequestType(InventoryRequest.RequestType.UPDATE);
        request.setRequestedBy(requestedBy);
        request.setRequestDate(LocalDateTime.now());
        request.setStatus(InventoryRequest.RequestStatus.PENDING);
        request.setInventoryId(inventoryId);
        request.setTargetInventoryId(existingInventory.get().getId());
        
        return inventoryRequestRepository.save(request);
    }
    
    public InventoryRequest submitDeleteRequest(String inventoryId, String requestedBy) {
        Optional<Inventory> existingInventory = inventoryRepository.findByInventoryId(inventoryId);
        if (!existingInventory.isPresent()) {
            throw new RuntimeException("Inventory not found with ID: " + inventoryId);
        }
        
        InventoryRequest request = new InventoryRequest();
        request.setRequestType(InventoryRequest.RequestType.DELETE);
        request.setRequestedBy(requestedBy);
        request.setRequestDate(LocalDateTime.now());
        request.setStatus(InventoryRequest.RequestStatus.PENDING);
        request.setInventoryId(inventoryId);
        request.setTargetInventoryId(existingInventory.get().getId());
        request.setName(existingInventory.get().getName());
        
        return inventoryRequestRepository.save(request);
    }
    
    // Admin approval operations
    @Transactional
    public void approveInventoryRequest(Long requestId, String approvedBy) {
        Optional<InventoryRequest> requestOpt = inventoryRequestRepository.findById(requestId);
        if (!requestOpt.isPresent()) {
            throw new RuntimeException("Request not found");
        }
        
        InventoryRequest request = requestOpt.get();
        request.setStatus(InventoryRequest.RequestStatus.APPROVED);
        request.setApprovedBy(approvedBy);
        request.setApprovalDate(LocalDateTime.now());
        inventoryRequestRepository.save(request);
        
        // Execute the actual operation
        switch (request.getRequestType()) {
            case CREATE:
                executeCreateInventory(request);
                break;
            case UPDATE:
                executeUpdateInventory(request);
                break;
            case DELETE:
                executeDeleteInventory(request);
                break;
        }
        
        // Send notification to requester
        String message = "Your inventory " + request.getRequestType().toString().toLowerCase() + 
                        " request for '" + request.getName() + "' has been approved.";
        notificationService.createNotification(request.getRequestedBy(), message);
    }
    
    @Transactional
    public void rejectInventoryRequest(Long requestId, String rejectedBy, String reason) {
        Optional<InventoryRequest> requestOpt = inventoryRequestRepository.findById(requestId);
        if (!requestOpt.isPresent()) {
            throw new RuntimeException("Request not found");
        }
        
        InventoryRequest request = requestOpt.get();
        request.setStatus(InventoryRequest.RequestStatus.REJECTED);
        request.setApprovedBy(rejectedBy);
        request.setApprovalDate(LocalDateTime.now());
        request.setRejectionReason(reason);
        inventoryRequestRepository.save(request);
        
        // Send notification to requester
        String message = "Your inventory " + request.getRequestType().toString().toLowerCase() + 
                        " request for '" + request.getName() + "' has been rejected. Reason: " + reason;
        notificationService.createNotification(request.getRequestedBy(), message);
    }
    
    private void executeCreateInventory(InventoryRequest request) {
        Inventory inventory = new Inventory();
        inventory.setInventoryId(request.getInventoryId());
        inventory.setName(request.getName());
        inventory.setProductionDate(request.getProductionDate());
        inventory.setExpiryDate(request.getExpiryDate());
        inventory.setQuantity(request.getQuantity());
        inventory.setPerQuantityPrice(request.getPerQuantityPrice());
        inventory.setBillNumber(request.getBillNumber());
        inventory.setSupplierName(request.getSupplierName());
        inventory.setCreatedDate(LocalDate.now());
        
        inventoryRepository.save(inventory);
    }
    
    private void executeUpdateInventory(InventoryRequest request) {
        Optional<Inventory> inventoryOpt = inventoryRepository.findById(request.getTargetInventoryId());
        if (inventoryOpt.isPresent()) {
            Inventory inventory = inventoryOpt.get();
            inventory.setName(request.getName());
            inventory.setProductionDate(request.getProductionDate());
            inventory.setExpiryDate(request.getExpiryDate());
            inventory.setQuantity(request.getQuantity());
            inventory.setPerQuantityPrice(request.getPerQuantityPrice());
            inventory.setBillNumber(request.getBillNumber());
            inventory.setSupplierName(request.getSupplierName());
            
            inventoryRepository.save(inventory);
        }
    }
    
    private void executeDeleteInventory(InventoryRequest request) {
        if (request.getTargetInventoryId() != null) {
            inventoryRepository.deleteById(request.getTargetInventoryId());
        }
    }
    
    public List<InventoryRequest> getPendingRequests() {
        return inventoryRequestRepository.findByStatus(InventoryRequest.RequestStatus.PENDING);
    }
    
    public List<InventoryRequest> getUserRequests(String username) {
        return inventoryRequestRepository.findByRequestedByOrderByRequestDateDesc(username);
    }
}