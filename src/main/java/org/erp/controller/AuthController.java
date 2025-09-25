package org.erp.controller;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LogManager.getLogger(AuthController.class);
    private final AuthenticationManager authenticationManager;

    public AuthController(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
        logger.info("AuthController initialized with AuthenticationManager");
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestParam String username,
            @RequestParam String password,
            HttpServletRequest request) {
        
        logger.info("Login attempt for username: {}", username);
        logger.debug("Password length: {} characters", password != null ? password.length() : 0);
        
        try {
            logger.debug("Starting authentication process for user: {}", username);
            
            // Create authentication token
            UsernamePasswordAuthenticationToken authToken = 
                new UsernamePasswordAuthenticationToken(username, password);
            logger.debug("Created authentication token for user: {}", username);
            
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(authToken);
            logger.debug("Authentication successful for user: {}, authorities: {}", 
                        username, authentication.getAuthorities());
            
            // Set authentication in security context
            SecurityContextHolder.getContext().setAuthentication(authentication);
            logger.debug("Set authentication in SecurityContext for user: {}", username);
            
            // Create or get session
            HttpSession session = request.getSession(true);
            logger.debug("Session created/retrieved: ID={}, isNew={}", 
                        session.getId(), session.isNew());
            
            // Store authentication in session for persistence
            session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());
            logger.debug("Stored SecurityContext in session for user: {}", username);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("username", username);
            response.put("sessionId", session.getId());
            response.put("authorities", authentication.getAuthorities());
            
            logger.info("Login successful for user: {}", username);
            return ResponseEntity.ok(response);
            
        } catch (BadCredentialsException e) {
            logger.warn("Login failed for user: {} - Bad credentials", username);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Invalid username or password");
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            
        } catch (AuthenticationException e) {
            logger.error("Authentication exception for user: {} - {}", username, e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Authentication failed: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            
        } catch (Exception e) {
            logger.error("Unexpected error during login for user: {} - {}", username, e.getMessage(), e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "An unexpected error occurred");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpServletRequest request, HttpServletResponse response) {
        Authentication currentAuth = SecurityContextHolder.getContext().getAuthentication();
        String username = currentAuth != null ? currentAuth.getName() : "unknown";
        
        logger.info("Logout request for user: {}", username);
        
        try {
            // Clear security context
            SecurityContextHolder.clearContext();
            logger.debug("SecurityContext cleared for user: {}", username);
            
            // Invalidate session
            HttpSession session = request.getSession(false);
            if (session != null) {
                String sessionId = session.getId();
                session.invalidate();
                logger.debug("Session invalidated: ID={} for user: {}", sessionId, username);
            } else {
                logger.debug("No session to invalidate for user: {}", username);
            }
            
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("success", true);
            responseBody.put("message", "Logged out successfully");
            
            logger.info("Logout successful for user: {}", username);
            return ResponseEntity.ok(responseBody);
            
        } catch (Exception e) {
            logger.error("Error during logout for user: {} - {}", username, e.getMessage(), e);
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("success", false);
            responseBody.put("error", "Logout failed");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseBody);
        }
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status(Authentication authentication, HttpServletRequest request) {
        logger.debug("Authentication status check requested");
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (authentication != null && authentication.isAuthenticated() && 
                !authentication.getName().equals("anonymousUser")) {
                
                String username = authentication.getName();
                logger.debug("User authenticated: {}, authorities: {}", 
                           username, authentication.getAuthorities());
                
                HttpSession session = request.getSession(false);
                String sessionId = session != null ? session.getId() : "none";
                
                response.put("authenticated", true);
                response.put("username", username);
                response.put("authorities", authentication.getAuthorities());
                response.put("sessionId", sessionId);
                
                logger.debug("Status check successful for user: {}", username);
                return ResponseEntity.ok(response);
                
            } else {
                logger.debug("User not authenticated or anonymous");
                response.put("authenticated", false);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
        } catch (Exception e) {
            logger.error("Error checking authentication status: {}", e.getMessage(), e);
            response.put("authenticated", false);
            response.put("error", "Status check failed");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}