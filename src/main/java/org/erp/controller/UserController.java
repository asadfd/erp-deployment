package org.erp.controller;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.erp.entity.Role;
import org.erp.entity.User;
import org.erp.repository.RoleRepository;
import org.erp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class UserController {

    private static final Logger logger = LogManager.getLogger(UserController.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/roles")
    public ResponseEntity<Map<String, Object>> getAllRoles() {
        logger.debug("Fetching all roles");
        
        try {
            List<Role> roles = roleRepository.findAll();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("roles", roles);
            
            logger.debug("Successfully fetched {} roles", roles.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error fetching roles: {}", e.getMessage(), e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Failed to fetch roles");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> getAllUsers() {
        logger.debug("Fetching all users");
        
        try {
            List<User> users = userRepository.findAll();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("users", users);
            
            logger.debug("Successfully fetched {} users", users.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error fetching users: {}", e.getMessage(), e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Failed to fetch users");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/{username}")
    public ResponseEntity<Map<String, Object>> getUserByUsername(@PathVariable String username) {
        logger.info("Fetching user details for username: {}", username);
        
        Optional<User> userOptional = userRepository.findByUsername(username);
        Map<String, Object> response = new HashMap<>();
        
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            response.put("success", true);
            response.put("id", user.getId());
            response.put("username", user.getUsername());
            // Don't send password to frontend
            logger.debug("User found: {}", username);
            return ResponseEntity.ok(response);
        } else {
            logger.warn("User not found: {}", username);
            response.put("success", false);
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateUser(
            @PathVariable Long id,
            @RequestBody Map<String, String> updateRequest) {
        
        logger.info("Updating user with id: {}", id);
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<User> userOptional = userRepository.findById(id);
            
            if (userOptional.isEmpty()) {
                logger.warn("User not found with id: {}", id);
                response.put("success", false);
                response.put("error", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            User user = userOptional.get();
            
            // Update username if provided
            String newUsername = updateRequest.get("username");
            if (newUsername != null && !newUsername.isEmpty()) {
                // Check if new username already exists
                Optional<User> existingUser = userRepository.findByUsername(newUsername);
                if (existingUser.isPresent() && !existingUser.get().getId().equals(id)) {
                    logger.warn("Username already exists: {}", newUsername);
                    response.put("success", false);
                    response.put("error", "Username already exists");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                }
                user.setUsername(newUsername);
                logger.debug("Username updated from {} to {}", user.getUsername(), newUsername);
            }
            
            // Update password if provided
            String newPassword = updateRequest.get("password");
            if (newPassword != null && !newPassword.isEmpty()) {
                user.setPassword(passwordEncoder.encode(newPassword));
                logger.debug("Password updated for user: {}", user.getUsername());
            }
            
            // Save updated user
            User updatedUser = userRepository.save(user);
            
            response.put("success", true);
            response.put("user", Map.of(
                "id", updatedUser.getId(),
                "username", updatedUser.getUsername()
            ));
            
            logger.info("User updated successfully: {}", updatedUser.getUsername());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error updating user: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "Failed to update user");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/{username}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable String username) {
        logger.info("Deleting user: {}", username);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Find user by username
            Optional<User> userOptional = userRepository.findByUsername(username);
            
            if (userOptional.isEmpty()) {
                logger.warn("User not found for deletion: {}", username);
                response.put("success", false);
                response.put("error", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            User user = userOptional.get();
            
            // Prevent deletion of superadmin user
            boolean isSuperAdmin = user.getRoles().stream()
                    .anyMatch(role -> "SUPER_ADMIN".equals(role.getName()));
            
            if (isSuperAdmin) {
                logger.warn("Attempted to delete super admin user: {}", username);
                response.put("success", false);
                response.put("error", "Cannot delete super admin user");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            // Delete the user
            userRepository.delete(user);
            
            response.put("success", true);
            response.put("message", "User deleted successfully");
            response.put("username", username);
            
            logger.info("Successfully deleted user: {}", username);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error deleting user: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "Failed to delete user");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody CreateUserRequest request) {
        logger.info("Creating new user: {}", request.getUsername());
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validate input
            if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
                response.put("success", false);
                response.put("error", "Username is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                response.put("success", false);
                response.put("error", "Password is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (request.getRoleId() == null) {
                response.put("success", false);
                response.put("error", "Role is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Check if username already exists
            if (userRepository.findByUsername(request.getUsername()).isPresent()) {
                response.put("success", false);
                response.put("error", "Username already exists");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Find the role
            Optional<Role> roleOpt = roleRepository.findById(request.getRoleId());
            if (roleOpt.isEmpty()) {
                response.put("success", false);
                response.put("error", "Invalid role selected");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Create new user
            User newUser = new User();
            newUser.setUsername(request.getUsername().trim());
            newUser.setPassword(passwordEncoder.encode(request.getPassword()));
            newUser.setEnabled(true);
            newUser.addRole(roleOpt.get());
            
            // Save user
            User savedUser = userRepository.save(newUser);
            
            response.put("success", true);
            response.put("message", "User created successfully");
            response.put("userId", savedUser.getId());
            response.put("username", savedUser.getUsername());
            
            logger.info("Successfully created user: {} with role: {}", 
                       savedUser.getUsername(), roleOpt.get().getName());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error creating user: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "Failed to create user");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Request DTO for creating user
    public static class CreateUserRequest {
        private String username;
        private String password;
        private Long roleId;

        // Getters and setters
        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public Long getRoleId() {
            return roleId;
        }

        public void setRoleId(Long roleId) {
            this.roleId = roleId;
        }
    }
}