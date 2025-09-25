package org.erp.controller;

import org.erp.entity.Inventory;
import org.erp.entity.Project;
import org.erp.entity.ProjectInventoryItem;
import org.erp.entity.PurchaseOrder;
import org.erp.repository.InventoryRepository;
import org.erp.repository.ProjectInventoryItemRepository;
import org.erp.repository.ProjectRepository;
import org.erp.service.PurchaseOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/projects/{projectId}/inventory")
@CrossOrigin(origins = "http://localhost:3000")
public class ProjectInventoryController {
    
    @Autowired
    private ProjectInventoryItemRepository projectInventoryItemRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private InventoryRepository inventoryRepository;
    
    @Autowired
    private PurchaseOrderService purchaseOrderService;
    
    @GetMapping
    public ResponseEntity<List<ProjectInventoryItem>> getProjectInventoryItems(@PathVariable Long projectId) {
        List<ProjectInventoryItem> items = projectInventoryItemRepository.findByProjectId(projectId);
        return ResponseEntity.ok(items);
    }
    
    @PostMapping
    public ResponseEntity<ProjectInventoryItem> addInventoryItemToProject(
            @PathVariable Long projectId,
            @RequestBody Map<String, Object> request) {
        try {
            Long inventoryId = Long.valueOf(request.get("inventoryId").toString());
            Integer requiredQuantity = Integer.valueOf(request.get("requiredQuantity").toString());
            
            Optional<Project> projectOpt = projectRepository.findById(projectId);
            Optional<Inventory> inventoryOpt = inventoryRepository.findById(inventoryId);
            
            if (projectOpt.isEmpty() || inventoryOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Project project = projectOpt.get();
            Inventory inventory = inventoryOpt.get();
            
            // Calculate allocated quantity and shortage
            Integer availableQuantity = inventory.getQuantity();
            Integer allocatedQuantity = Math.min(requiredQuantity, availableQuantity);
            Integer shortageQuantity = Math.max(0, requiredQuantity - availableQuantity);
            
            BigDecimal unitPrice = inventory.getPerQuantityPrice();
            BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(allocatedQuantity));
            
            ProjectInventoryItem projectInventoryItem = new ProjectInventoryItem(
                project, inventory, requiredQuantity, allocatedQuantity, 
                shortageQuantity, unitPrice, totalPrice
            );
            
            ProjectInventoryItem savedItem = projectInventoryItemRepository.save(projectInventoryItem);
            
            // Update inventory quantity (reduce by allocated amount)
            inventory.setQuantity(availableQuantity - allocatedQuantity);
            inventoryRepository.save(inventory);
            
            return ResponseEntity.ok(savedItem);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> removeInventoryItemFromProject(
            @PathVariable Long projectId,
            @PathVariable Long itemId) {
        try {
            Optional<ProjectInventoryItem> itemOpt = projectInventoryItemRepository.findById(itemId);
            
            if (itemOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            ProjectInventoryItem item = itemOpt.get();
            
            // Return the allocated quantity back to inventory
            Inventory inventory = item.getInventory();
            inventory.setQuantity(inventory.getQuantity() + item.getAllocatedQuantity());
            inventoryRepository.save(inventory);
            
            projectInventoryItemRepository.deleteById(itemId);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/expense")
    public ResponseEntity<Map<String, Object>> getProjectInventoryExpense(@PathVariable Long projectId) {
        try {
            Double totalExpense = projectInventoryItemRepository.getTotalInventoryExpenseByProjectId(projectId);
            if (totalExpense == null) {
                totalExpense = 0.0;
            }
            
            return ResponseEntity.ok(Map.of("totalExpense", totalExpense));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{itemId}/create-po")
    public ResponseEntity<Map<String, Object>> createPurchaseOrder(
            @PathVariable Long projectId,
            @PathVariable Long itemId,
            @RequestBody(required = false) Map<String, String> request) {
        try {
            String supplierName = request != null ? request.get("supplierName") : "Default Supplier";
            String currentUser = "admin"; // In real app, get from SecurityContext
            
            PurchaseOrder po = purchaseOrderService.createPurchaseOrderFromShortage(
                projectId, itemId, supplierName, currentUser
            );
            
            return ResponseEntity.ok(Map.of(
                "message", "Purchase Order created successfully",
                "poId", po.getPoNumber(),
                "purchaseOrderId", po.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }
}