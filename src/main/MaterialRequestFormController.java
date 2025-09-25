package org.erp.controller;

import org.erp.entity.MaterialRequestForm;
import org.erp.entity.MRFItem;
import org.erp.service.MaterialRequestFormService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/mrf")
public class MaterialRequestFormController {
    
    @Autowired
    private MaterialRequestFormService mrfService;
    
    @GetMapping
    @PreAuthorize("hasRole('PROJECTMANAGER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<MaterialRequestForm>> getAllMRFs() {
        try {
            List<MaterialRequestForm> mrfs = mrfService.getAllMRFs();
            return ResponseEntity.ok(mrfs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('PROJECTMANAGER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<MaterialRequestForm> getMRFById(@PathVariable Long id) {
        try {
            Optional<MaterialRequestForm> mrf = mrfService.getMRFById(id);
            if (mrf.isPresent()) {
                return ResponseEntity.ok(mrf.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/number/{mrfNumber}")
    @PreAuthorize("hasRole('PROJECTMANAGER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<MaterialRequestForm> getMRFByNumber(@PathVariable String mrfNumber) {
        try {
            Optional<MaterialRequestForm> mrf = mrfService.getMRFByNumber(mrfNumber);
            if (mrf.isPresent()) {
                return ResponseEntity.ok(mrf.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/my")
    @PreAuthorize("hasRole('PROJECTMANAGER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<MaterialRequestForm>> getMyMRFs(Authentication auth) {
        try {
            List<MaterialRequestForm> mrfs = mrfService.getUserMRFs(auth.getName());
            return ResponseEntity.ok(mrfs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping
    @PreAuthorize("hasRole('PROJECTMANAGER')")
    public ResponseEntity<MaterialRequestForm> createMRF(@RequestBody MaterialRequestForm mrf, Authentication auth) {
        try {
            System.out.println("Creating MRF for user: " + auth.getName());
            System.out.println("MRF requestor name: " + mrf.getRequestorName());
            System.out.println("MRF items count: " + (mrf.getItems() != null ? mrf.getItems().size() : 0));
            if (mrf.getItems() != null) {
                for (int i = 0; i < mrf.getItems().size(); i++) {
                    MRFItem item = mrf.getItems().get(i);
                    System.out.println("Item " + i + ": " + item.getItemDescription() + 
                        ", qty: " + item.getQuantity() + 
                        ", price: " + item.getUnitPrice());
                }
            }
            MaterialRequestForm savedMRF = mrfService.createMRF(mrf, auth.getName());
            return ResponseEntity.ok(savedMRF);
        } catch (Exception e) {
            System.err.println("Error creating MRF: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PROJECTMANAGER')")
    public ResponseEntity<MaterialRequestForm> updateMRF(
            @PathVariable Long id, 
            @RequestBody MaterialRequestForm mrf, 
            Authentication auth) {
        try {
            MaterialRequestForm updatedMRF = mrfService.updateMRF(id, mrf, auth.getName());
            return ResponseEntity.ok(updatedMRF);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PROJECTMANAGER')")
    public ResponseEntity<Void> deleteMRF(@PathVariable Long id, Authentication auth) {
        try {
            mrfService.deleteMRF(id, auth.getName());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> getPendingMRFs(Authentication auth) {
        try {
            List<MaterialRequestForm> pendingMRFs;
            
            // Check user role to determine which pending MRFs to show
            boolean isSuperAdmin = auth.getAuthorities().stream()
                    .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_SUPER_ADMIN"));
            
            if (isSuperAdmin) {
                // SuperAdmin sees all pending MRFs
                pendingMRFs = mrfService.getPendingMRFs();
            } else {
                // Admin only sees MRFs that don't require SuperAdmin approval
                pendingMRFs = mrfService.getPendingMRFsForAdmin();
            }
            
            return ResponseEntity.ok(pendingMRFs);
        } catch (Exception e) {
            e.printStackTrace(); // Log the error for debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching pending MRFs: " + e.getMessage());
        }
    }
    
    @GetMapping("/pending/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<MaterialRequestForm>> getPendingMRFsForAdmin() {
        try {
            List<MaterialRequestForm> mrfs = mrfService.getPendingMRFsForAdmin();
            return ResponseEntity.ok(mrfs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/pending/superadmin")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<MaterialRequestForm>> getPendingMRFsForSuperAdmin() {
        try {
            List<MaterialRequestForm> mrfs = mrfService.getPendingMRFsForSuperAdmin();
            return ResponseEntity.ok(mrfs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<String> approveMRF(@PathVariable Long id, Authentication auth) {
        try {
            // Get MRF to check if user has permission to approve
            Optional<MaterialRequestForm> mrfOpt = mrfService.getMRFById(id);
            if (!mrfOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            MaterialRequestForm mrf = mrfOpt.get();
            boolean isSuperAdmin = auth.getAuthorities().stream()
                    .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_SUPER_ADMIN"));
            
            // Check if user has permission to approve this MRF
            if (mrf.getRequiresSuperadmin() && !isSuperAdmin) {
                return ResponseEntity.status(403).body("This MRF requires SuperAdmin approval");
            }
            
            mrfService.approveMRF(id, auth.getName());
            return ResponseEntity.ok("MRF approved successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<String> rejectMRF(
            @PathVariable Long id, 
            @RequestBody String reason, 
            Authentication auth) {
        try {
            // Get MRF to check if user has permission to reject
            Optional<MaterialRequestForm> mrfOpt = mrfService.getMRFById(id);
            if (!mrfOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            MaterialRequestForm mrf = mrfOpt.get();
            boolean isSuperAdmin = auth.getAuthorities().stream()
                    .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_SUPER_ADMIN"));
            
            // Check if user has permission to reject this MRF
            if (mrf.getRequiresSuperadmin() && !isSuperAdmin) {
                return ResponseEntity.status(403).body("This MRF requires SuperAdmin approval");
            }
            
            mrfService.rejectMRF(id, auth.getName(), reason);
            return ResponseEntity.ok("MRF rejected successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}