package org.erp.controller;

import org.erp.entity.Inventory;
import org.erp.entity.InventoryRequest;
import org.erp.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {
    
    @Autowired
    private InventoryService inventoryService;
    
    @GetMapping
    @PreAuthorize("hasRole('PROJECTMANAGER') or hasRole('SUPERADMIN')")
    public ResponseEntity<List<Inventory>> getAllInventory() {
        try {
            List<Inventory> inventory = inventoryService.getAllInventory();
            return ResponseEntity.ok(inventory);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{inventoryId}")
    @PreAuthorize("hasRole('PROJECTMANAGER') or hasRole('SUPERADMIN')")
    public ResponseEntity<Inventory> getInventoryByInventoryId(@PathVariable String inventoryId) {
        try {
            Optional<Inventory> inventory = inventoryService.getInventoryByInventoryId(inventoryId);
            if (inventory.isPresent()) {
                return ResponseEntity.ok(inventory.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/request/create")
    @PreAuthorize("hasRole('PROJECTMANAGER')")
    public ResponseEntity<InventoryRequest> submitCreateRequest(@RequestBody InventoryRequest request, Authentication auth) {
        try {
            InventoryRequest savedRequest = inventoryService.submitCreateRequest(request, auth.getName());
            return ResponseEntity.ok(savedRequest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/request/update/{inventoryId}")
    @PreAuthorize("hasRole('PROJECTMANAGER')")
    public ResponseEntity<InventoryRequest> submitUpdateRequest(
            @PathVariable String inventoryId, 
            @RequestBody InventoryRequest request, 
            Authentication auth) {
        try {
            InventoryRequest savedRequest = inventoryService.submitUpdateRequest(inventoryId, request, auth.getName());
            return ResponseEntity.ok(savedRequest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/request/delete/{inventoryId}")
    @PreAuthorize("hasRole('PROJECTMANAGER')")
    public ResponseEntity<InventoryRequest> submitDeleteRequest(@PathVariable String inventoryId, Authentication auth) {
        try {
            InventoryRequest savedRequest = inventoryService.submitDeleteRequest(inventoryId, auth.getName());
            return ResponseEntity.ok(savedRequest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/requests")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<List<InventoryRequest>> getPendingRequests() {
        try {
            List<InventoryRequest> requests = inventoryService.getPendingRequests();
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/requests/my")
    @PreAuthorize("hasRole('PROJECTMANAGER')")
    public ResponseEntity<List<InventoryRequest>> getMyRequests(Authentication auth) {
        try {
            List<InventoryRequest> requests = inventoryService.getUserRequests(auth.getName());
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/requests/{requestId}/approve")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<Void> approveRequest(@PathVariable Long requestId, Authentication auth) {
        try {
            inventoryService.approveInventoryRequest(requestId, auth.getName());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/requests/{requestId}/reject")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<Void> rejectRequest(
            @PathVariable Long requestId, 
            @RequestBody String reason, 
            Authentication auth) {
        try {
            inventoryService.rejectInventoryRequest(requestId, auth.getName(), reason);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}