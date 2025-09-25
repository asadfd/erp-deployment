package org.erp.service;

import org.erp.entity.*;
import org.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PurchaseOrderService {
    
    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;
    
    @Autowired
    private PurchaseOrderItemRepository purchaseOrderItemRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private InventoryRepository inventoryRepository;
    
    @Autowired
    private ProjectInventoryItemRepository projectInventoryItemRepository;
    
    @Autowired
    private PurchaseOrderRequestRepository purchaseOrderRequestRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    public PurchaseOrder createPurchaseOrder(PurchaseOrder purchaseOrder, List<Long> inventoryIds, 
                                           List<Integer> quantities, Long projectId, String currentUser) {
        try {
            // Validate input
            if (purchaseOrder == null) {
                throw new IllegalArgumentException("Purchase order cannot be null");
            }
            if (projectId == null) {
                throw new IllegalArgumentException("Project ID cannot be null");
            }
            
            // Load the full project entity
            Project fullProject = projectRepository.findById(projectId)
                    .orElseThrow(() -> new IllegalArgumentException("Project not found with ID: " + projectId));
            purchaseOrder.setProject(fullProject);
            
            // Generate PO number: PROJECT_ID-PO-TIMESTAMP
            String poNumber = generatePONumber(fullProject.getId());
            purchaseOrder.setPoNumber(poNumber);
            purchaseOrder.setCreatedBy(currentUser);
            purchaseOrder.setCreatedDate(LocalDateTime.now());
            purchaseOrder.setPoStatus(PurchaseOrder.POStatus.CREATED);
            
            // Save PO first
            PurchaseOrder savedPO = purchaseOrderRepository.save(purchaseOrder);
            
            // Create PO items
            BigDecimal totalAmount = BigDecimal.ZERO;
            for (int i = 0; i < inventoryIds.size(); i++) {
                Optional<Inventory> inventoryOpt = inventoryRepository.findById(inventoryIds.get(i));
                if (inventoryOpt.isPresent()) {
                    Inventory inventory = inventoryOpt.get();
                    Integer quantity = quantities.get(i);
                    BigDecimal unitPrice = inventory.getPerQuantityPrice();
                    
                    PurchaseOrderItem poItem = new PurchaseOrderItem(savedPO, inventory, quantity, unitPrice);
                    purchaseOrderItemRepository.save(poItem);
                    
                    totalAmount = totalAmount.add(poItem.getTotalPrice());
                }
            }
            
            // Update PO total amount
            savedPO.setTotalAmount(totalAmount);
            purchaseOrderRepository.save(savedPO);
            
            // Create approval request for the PO - auto-approve for superadmin
            PurchaseOrderRequest poRequest = new PurchaseOrderRequest(savedPO, currentUser);
            
            // Check if current user is superadmin - if so, auto-approve
            if (isUserSuperAdmin(currentUser)) {
                poRequest.setRequestStatus(PurchaseOrderRequest.RequestStatus.APPROVED);
                poRequest.setApprovedBy(currentUser);
                poRequest.setApprovalDate(LocalDateTime.now());
                savedPO.setIsApproved(true);
                purchaseOrderRepository.save(savedPO);
                
                // Update project stage to ORDER_STAGE for auto-approved PO
                Project project = savedPO.getProject();
                if (!"ORDER_STAGE".equals(project.getProjectStage())) {
                    project.setProjectStage("ORDER_STAGE");
                    projectRepository.save(project);
                }
                
                // Check budget and send notification if below 50%
                checkBudgetAndNotify(project);
            } else {
                // For non-superadmin users, notify all superadmins for approval
                notificationService.notifyAllSuperAdminsForPOApproval(poNumber, currentUser);
            }
            
            purchaseOrderRequestRepository.save(poRequest);
            
            return savedPO;
        } catch (Exception e) {
            throw new RuntimeException("Failed to create purchase order: " + e.getMessage());
        }
    }
    
    public List<PurchaseOrder> getPurchaseOrdersByProject(Long projectId) {
        return purchaseOrderRepository.findByProject_Id(projectId);
    }
    
    public List<PurchaseOrder> getPurchaseOrdersByProjects(List<Long> projectIds) {
        return purchaseOrderRepository.findByProjectIds(projectIds);
    }
    
    public Optional<PurchaseOrder> getPurchaseOrderById(Long id) {
        return purchaseOrderRepository.findById(id);
    }
    
    public List<PurchaseOrderItem> getPurchaseOrderItems(Long purchaseOrderId) {
        return purchaseOrderItemRepository.findByPurchaseOrderId(purchaseOrderId);
    }
    
    public PurchaseOrder updatePurchaseOrderStatus(Long purchaseOrderId, PurchaseOrder.POStatus newStatus) {
        Optional<PurchaseOrder> poOpt = purchaseOrderRepository.findById(purchaseOrderId);
        if (poOpt.isPresent()) {
            PurchaseOrder po = poOpt.get();
            po.setPoStatus(newStatus);
            return purchaseOrderRepository.save(po);
        }
        throw new RuntimeException("Purchase Order not found");
    }
    
    public void deletePurchaseOrder(Long purchaseOrderId) {
        Optional<PurchaseOrder> poOpt = purchaseOrderRepository.findById(purchaseOrderId);
        if (poOpt.isPresent()) {
            PurchaseOrder po = poOpt.get();
            
            // Only allow deletion if PO is in CREATED status
            if (po.getPoStatus() == PurchaseOrder.POStatus.CREATED) {
                purchaseOrderRepository.deleteById(purchaseOrderId);
            } else {
                throw new RuntimeException("Cannot delete PO that has been sent to supplier");
            }
        } else {
            throw new RuntimeException("Purchase Order not found");
        }
    }
    
    public List<PurchaseOrder> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAll();
    }
    
    public Page<PurchaseOrder> getAllPurchaseOrders(Pageable pageable) {
        return purchaseOrderRepository.findAll(pageable);
    }
    
    private String generatePONumber(Long projectId) {
        long timestamp = System.currentTimeMillis();
        return projectId + "-PO-" + timestamp;
    }
    
    public PurchaseOrder createPurchaseOrderFromShortage(Long projectId, Long projectInventoryItemId, 
                                                        String supplierName, String createdBy) {
        try {
            // Get project and project inventory item
            Optional<Project> projectOpt = projectRepository.findById(projectId);
            Optional<ProjectInventoryItem> itemOpt = projectInventoryItemRepository.findById(projectInventoryItemId);
            
            if (projectOpt.isEmpty() || itemOpt.isEmpty()) {
                throw new RuntimeException("Project or ProjectInventoryItem not found");
            }
            
            Project project = projectOpt.get();
            ProjectInventoryItem shortageItem = itemOpt.get();
            
            // Create PO
            String poNumber = generatePONumber(projectId);
            PurchaseOrder po = new PurchaseOrder();
            po.setPoNumber(poNumber);
            po.setProject(project);
            po.setSupplierName(supplierName);
            po.setPoStatus(PurchaseOrder.POStatus.CREATED);
            po.setCreatedBy(createdBy);
            po.setCreatedDate(LocalDateTime.now());
            
            PurchaseOrder savedPO = purchaseOrderRepository.save(po);
            
            // Create PO item for shortage quantity
            Inventory inventory = shortageItem.getInventory();
            Integer shortageQuantity = shortageItem.getShortageQuantity();
            BigDecimal unitPrice = shortageItem.getUnitPrice();
            
            PurchaseOrderItem poItem = new PurchaseOrderItem(savedPO, inventory, shortageQuantity, unitPrice);
            purchaseOrderItemRepository.save(poItem);
            
            // Update PO total
            savedPO.setTotalAmount(poItem.getTotalPrice());
            purchaseOrderRepository.save(savedPO);
            
            // Mark PO as created in ProjectInventoryItem
            shortageItem.setPoCreated(true);
            projectInventoryItemRepository.save(shortageItem);
            
            // Create approval request for the PO - auto-approve for superadmin
            PurchaseOrderRequest poRequest = new PurchaseOrderRequest(savedPO, createdBy);
            
            // Check if current user is superadmin - if so, auto-approve
            if (isUserSuperAdmin(createdBy)) {
                poRequest.setRequestStatus(PurchaseOrderRequest.RequestStatus.APPROVED);
                poRequest.setApprovedBy(createdBy);
                poRequest.setApprovalDate(LocalDateTime.now());
                savedPO.setIsApproved(true);
                purchaseOrderRepository.save(savedPO);
                
                // Update project stage to ORDER_STAGE for auto-approved PO
                if (!"ORDER_STAGE".equals(project.getProjectStage())) {
                    project.setProjectStage("ORDER_STAGE");
                    projectRepository.save(project);
                }
                
                // Check budget and send notification if below 50%
                checkBudgetAndNotify(project);
            } else {
                // For non-superadmin users, notify all superadmins for approval
                notificationService.notifyAllSuperAdminsForPOApproval(savedPO.getPoNumber(), createdBy);
            }
            
            purchaseOrderRequestRepository.save(poRequest);
            
            return savedPO;
        } catch (Exception e) {
            throw new RuntimeException("Failed to create PO from shortage: " + e.getMessage());
        }
    }
    
    public PurchaseOrderRequest approvePurchaseOrder(Long requestId, String approver) {
        Optional<PurchaseOrderRequest> requestOpt = purchaseOrderRequestRepository.findById(requestId);
        if (requestOpt.isEmpty()) {
            throw new RuntimeException("Purchase Order Request not found");
        }
        
        PurchaseOrderRequest poRequest = requestOpt.get();
        if (poRequest.getRequestStatus() != PurchaseOrderRequest.RequestStatus.PENDING) {
            throw new RuntimeException("Purchase Order has already been processed");
        }
        
        // Update request status
        poRequest.setRequestStatus(PurchaseOrderRequest.RequestStatus.APPROVED);
        poRequest.setApprovedBy(approver);
        poRequest.setApprovalDate(LocalDateTime.now());
        purchaseOrderRequestRepository.save(poRequest);
        
        // Update PO approval status
        PurchaseOrder po = poRequest.getPurchaseOrder();
        po.setIsApproved(true);
        purchaseOrderRepository.save(po);
        
        // Update project stage to ORDER_STAGE
        Project project = po.getProject();
        if (!"ORDER_STAGE".equals(project.getProjectStage())) {
            project.setProjectStage("ORDER_STAGE");
            projectRepository.save(project);
        }
        
        // Check budget and send notification if below 50%
        checkBudgetAndNotify(project);
        
        return poRequest;
    }
    
    public PurchaseOrderRequest rejectPurchaseOrder(Long requestId, String approver, String rejectionReason) {
        Optional<PurchaseOrderRequest> requestOpt = purchaseOrderRequestRepository.findById(requestId);
        if (requestOpt.isEmpty()) {
            throw new RuntimeException("Purchase Order Request not found");
        }
        
        PurchaseOrderRequest poRequest = requestOpt.get();
        if (poRequest.getRequestStatus() != PurchaseOrderRequest.RequestStatus.PENDING) {
            throw new RuntimeException("Purchase Order has already been processed");
        }
        
        // Update request status
        poRequest.setRequestStatus(PurchaseOrderRequest.RequestStatus.REJECTED);
        poRequest.setApprovedBy(approver);
        poRequest.setApprovalDate(LocalDateTime.now());
        poRequest.setRejectionReason(rejectionReason);
        purchaseOrderRequestRepository.save(poRequest);
        
        // Update PO status to CANCELLED
        PurchaseOrder po = poRequest.getPurchaseOrder();
        po.setPoStatus(PurchaseOrder.POStatus.CANCELLED);
        purchaseOrderRepository.save(po);
        
        return poRequest;
    }
    
    public List<PurchaseOrderRequest> getPendingPurchaseOrderRequests() {
        return purchaseOrderRequestRepository.findByRequestStatus(PurchaseOrderRequest.RequestStatus.PENDING);
    }
    
    private void checkBudgetAndNotify(Project project) {
        BigDecimal projectBudget = project.getProjectBudget();
        if (projectBudget != null && projectBudget.compareTo(BigDecimal.ZERO) > 0) {
            // Calculate total spent on POs for this project
            List<PurchaseOrder> approvedPOs = purchaseOrderRepository.findByProject_Id(project.getId())
                    .stream()
                    .filter(po -> Boolean.TRUE.equals(po.getIsApproved()))
                    .toList();
            
            BigDecimal totalSpent = approvedPOs.stream()
                    .map(PurchaseOrder::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal remainingBudget = projectBudget.subtract(totalSpent);
            BigDecimal fiftyPercentBudget = projectBudget.multiply(new BigDecimal("0.5"));
            
            if (remainingBudget.compareTo(fiftyPercentBudget) <= 0) {
                // Budget is at or below 50% - this would trigger a notification
                // In a real system, this would send an email or push notification
                // For now, we'll just log it
                System.out.println("BUDGET ALERT: Project " + project.getId() + 
                    " budget is below 50%. Remaining: " + remainingBudget + 
                    " out of " + projectBudget);
            }
        }
    }
    
    private boolean isUserSuperAdmin(String username) {
        return userRepository.findByUsername(username)
                .map(user -> user.getRoles().stream()
                    .anyMatch(role -> "SUPER_ADMIN".equals(role.getName())))
                .orElse(false);
    }
}