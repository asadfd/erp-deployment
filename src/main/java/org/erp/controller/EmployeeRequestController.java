package org.erp.controller;

import org.erp.entity.EmployeeRequest;
import org.erp.entity.InventoryRequest;
import org.erp.entity.User;
import org.erp.service.EmployeeRequestService;
import org.erp.service.InventoryService;
import org.erp.service.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/employee-requests")
public class EmployeeRequestController {

    private static final Logger logger = LoggerFactory.getLogger(EmployeeRequestController.class);

    @Autowired
    private EmployeeRequestService employeeRequestService;
    
    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @PostMapping(value = "/create", consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('HRMANAGER')")
    public ResponseEntity<?> createEmployeeRequest(@RequestPart(value = "employeeData") @Valid EmployeeRequest request,
                                                  @RequestPart(value = "joiningDocs", required = false) MultipartFile file,
                                                  Authentication authentication) {
        try {
            logger.info("Received employee creation request");
            if (file != null) {
                logger.info("File received: name={}, size={} bytes", file.getOriginalFilename(), file.getSize());
            }
            
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User currentUser = userDetailsService.getUserByUsername(userDetails.getUsername());
            
            EmployeeRequest createdRequest = employeeRequestService.createEmployeeRequest(request, currentUser, file);
            return ResponseEntity.ok(Map.of(
                "message", "Employee request created successfully and sent for approval",
                "request", createdRequest
            ));
        } catch (Exception e) {
            logger.error("Error creating employee request", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<EmployeeRequest>> getPendingRequests() {
        List<EmployeeRequest> pendingRequests = employeeRequestService.getPendingRequests();
        return ResponseEntity.ok(pendingRequests);
    }
    
    @GetMapping("/inventory/pending")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<InventoryRequest>> getPendingInventoryRequests() {
        List<InventoryRequest> pendingRequests = inventoryService.getPendingRequests();
        return ResponseEntity.ok(pendingRequests);
    }

    @GetMapping("/my-requests")
    @PreAuthorize("hasRole('HRMANAGER')")
    public ResponseEntity<List<EmployeeRequest>> getMyRequests(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User currentUser = userDetailsService.getUserByUsername(userDetails.getUsername());
        
        List<EmployeeRequest> myRequests = employeeRequestService.getRequestsByHRManager(currentUser);
        return ResponseEntity.ok(myRequests);
    }

    @PostMapping("/approve/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> approveRequest(@PathVariable Long id, Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User currentUser = userDetailsService.getUserByUsername(userDetails.getUsername());
            
            EmployeeRequest approvedRequest = employeeRequestService.approveRequest(id, currentUser);
            return ResponseEntity.ok(Map.of(
                "message", "Employee request approved successfully",
                "request", approvedRequest
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/reject/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id, 
                                         @RequestBody Map<String, String> rejectionData,
                                         Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User currentUser = userDetailsService.getUserByUsername(userDetails.getUsername());
            String reason = rejectionData.get("reason");
            
            if (reason == null || reason.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Rejection reason is required"));
            }
            
            EmployeeRequest rejectedRequest = employeeRequestService.rejectRequest(id, currentUser, reason);
            return ResponseEntity.ok(Map.of(
                "message", "Employee request rejected",
                "request", rejectedRequest
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('HRMANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<?> getRequestById(@PathVariable Long id) {
        try {
            EmployeeRequest request = employeeRequestService.getRequestById(id);
            return ResponseEntity.ok(request);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/inventory/approve/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> approveInventoryRequest(@PathVariable Long id, Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            inventoryService.approveInventoryRequest(id, userDetails.getUsername());
            return ResponseEntity.ok(Map.of("message", "Inventory request approved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/inventory/reject/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> rejectInventoryRequest(@PathVariable Long id, 
                                         @RequestBody Map<String, String> rejectionData,
                                         Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String reason = rejectionData.get("reason");
            
            if (reason == null || reason.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Rejection reason is required"));
            }
            
            inventoryService.rejectInventoryRequest(id, userDetails.getUsername(), reason);
            return ResponseEntity.ok(Map.of("message", "Inventory request rejected"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/download-docs/{employeeId}")
    @PreAuthorize("hasAnyRole('HRMANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<?> downloadJoiningDocs(@PathVariable Long employeeId) {
        try {
            // Get the file path from the service
            String filePath = employeeRequestService.getEmployeeJoiningDocsPath(employeeId);
            
            if (filePath == null || filePath.trim().isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            // Create Path object from the stored file path
            Path path = Paths.get(filePath).normalize();
            
            // Check if file exists
            if (!Files.exists(path)) {
                return ResponseEntity.notFound().build();
            }
            
            // Create resource from the file
            Resource resource = new UrlResource(path.toUri());
            
            // Check if resource is readable
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }
            
            // Get filename from the path
            String filename = path.getFileName().toString();
            
            // Determine content type
            String contentType = Files.probeContentType(path);
            if (contentType == null) {
                contentType = "application/zip"; // Default to ZIP as per validation
            }
            
            // Return the file as response
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(resource);
                    
        } catch (Exception e) {
            logger.error("Error downloading file for employee {}: {}", employeeId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}