package org.erp.controller;

import org.erp.entity.PurchaseOrder;
import org.erp.entity.PurchaseOrderItem;
import org.erp.entity.PurchaseOrderRequest;
import org.erp.service.PurchaseOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/purchase-orders")
@CrossOrigin(origins = "http://localhost:3000")
public class PurchaseOrderController {
    
    @Autowired
    private PurchaseOrderService purchaseOrderService;
    
    @PostMapping
    @PreAuthorize("hasRole('PROJECTMANAGER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<PurchaseOrder> createPurchaseOrder(@RequestBody CreatePORequest request) {
        try {
            String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
            PurchaseOrder po = purchaseOrderService.createPurchaseOrder(
                request.getPurchaseOrder(), 
                request.getInventoryIds(), 
                request.getQuantities(),
                request.getProjectId(),
                currentUser
            );
            return ResponseEntity.ok(po);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error creating purchase order: " + e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @PostMapping("/from-shortage")
    @PreAuthorize("hasRole('PROJECTMANAGER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<PurchaseOrder> createPurchaseOrderFromShortage(@RequestBody ShortagePORequest request) {
        try {
            String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
            PurchaseOrder po = purchaseOrderService.createPurchaseOrderFromShortage(
                request.getProjectId(),
                request.getProjectInventoryItemId(),
                request.getSupplierName(),
                currentUser
            );
            return ResponseEntity.ok(po);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('PROJECTMANAGER')")
    public ResponseEntity<Page<PurchaseOrder>> getAllPurchaseOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            System.out.println("getAllPurchaseOrders -- ");
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : 
                Sort.by(sortBy).ascending();
            
            Pageable pageable = PageRequest.of(page, size, sort);
            Page<PurchaseOrder> pos = purchaseOrderService.getAllPurchaseOrders(pageable);
            return ResponseEntity.ok(pos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<PurchaseOrder> getPurchaseOrderById(@PathVariable Long id) {
        Optional<PurchaseOrder> po = purchaseOrderService.getPurchaseOrderById(id);
        return po.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<PurchaseOrder>> getPurchaseOrdersByProject(@PathVariable Long projectId) {
        List<PurchaseOrder> pos = purchaseOrderService.getPurchaseOrdersByProject(projectId);
        return ResponseEntity.ok(pos);
    }
    
    @GetMapping("/projects")
    public ResponseEntity<List<PurchaseOrder>> getPurchaseOrdersByProjects(@RequestParam List<Long> projectIds) {
        List<PurchaseOrder> pos = purchaseOrderService.getPurchaseOrdersByProjects(projectIds);
        return ResponseEntity.ok(pos);
    }
    
    @GetMapping("/{id}/items")
    public ResponseEntity<List<PurchaseOrderItem>> getPurchaseOrderItems(@PathVariable Long id) {
        List<PurchaseOrderItem> items = purchaseOrderService.getPurchaseOrderItems(id);
        return ResponseEntity.ok(items);
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<PurchaseOrder> updatePurchaseOrderStatus(
            @PathVariable Long id, 
            @RequestBody Map<String, String> request) {
        try {
            PurchaseOrder.POStatus status = PurchaseOrder.POStatus.valueOf(request.get("status"));
            PurchaseOrder updatedPO = purchaseOrderService.updatePurchaseOrderStatus(id, status);
            return ResponseEntity.ok(updatedPO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePurchaseOrder(@PathVariable Long id) {
        try {
            purchaseOrderService.deletePurchaseOrder(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/statuses")
    public ResponseEntity<List<String>> getPOStatuses() {
        List<String> statuses = List.of(
            "CREATED", "SENT_TO_SUPPLIER", "SUPPLIER_ACCEPTED", "SUPPLIER_REJECTED",
            "IN_PRODUCTION", "SHIPPED", "DELIVERED", "COMPLETED", "CANCELLED"
        );
        return ResponseEntity.ok(statuses);
    }
    
    @GetMapping("/requests/pending")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<PurchaseOrderRequest>> getPendingRequests() {
        List<PurchaseOrderRequest> pendingRequests = purchaseOrderService.getPendingPurchaseOrderRequests();
        return ResponseEntity.ok(pendingRequests);
    }
    
    @PostMapping("/requests/{requestId}/approve")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<PurchaseOrderRequest> approvePurchaseOrder(@PathVariable Long requestId) {
        try {
            String approver = SecurityContextHolder.getContext().getAuthentication().getName();
            PurchaseOrderRequest approvedRequest = purchaseOrderService.approvePurchaseOrder(requestId, approver);
            return ResponseEntity.ok(approvedRequest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/requests/{requestId}/reject")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<PurchaseOrderRequest> rejectPurchaseOrder(
            @PathVariable Long requestId,
            @RequestBody Map<String, String> request) {
        try {
            String approver = SecurityContextHolder.getContext().getAuthentication().getName();
            String rejectionReason = request.get("rejectionReason");
            PurchaseOrderRequest rejectedRequest = purchaseOrderService.rejectPurchaseOrder(requestId, approver, rejectionReason);
            return ResponseEntity.ok(rejectedRequest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Request DTOs
    public static class CreatePORequest {
        private PurchaseOrder purchaseOrder;
        private List<Long> inventoryIds;
        private List<Integer> quantities;
        private Long projectId;
        
        public PurchaseOrder getPurchaseOrder() { return purchaseOrder; }
        public void setPurchaseOrder(PurchaseOrder purchaseOrder) { this.purchaseOrder = purchaseOrder; }
        public List<Long> getInventoryIds() { return inventoryIds; }
        public void setInventoryIds(List<Long> inventoryIds) { this.inventoryIds = inventoryIds; }
        public List<Integer> getQuantities() { return quantities; }
        public void setQuantities(List<Integer> quantities) { this.quantities = quantities; }
        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }
    }
    
    public static class ShortagePORequest {
        private Long projectId;
        private Long projectInventoryItemId;
        private String supplierName;
        
        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }
        public Long getProjectInventoryItemId() { return projectInventoryItemId; }
        public void setProjectInventoryItemId(Long projectInventoryItemId) { this.projectInventoryItemId = projectInventoryItemId; }
        public String getSupplierName() { return supplierName; }
        public void setSupplierName(String supplierName) { this.supplierName = supplierName; }
    }
}