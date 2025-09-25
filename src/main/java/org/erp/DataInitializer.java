package org.erp;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.erp.entity.*;
import org.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LogManager.getLogger(DataInitializer.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private EmployeeRepository employeeRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private TimesheetRepository timesheetRepository;
    
    @Autowired
    private CashFlowRepository cashFlowRepository;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Starting data initialization...");
        
        try {
            // Create roles first
            initializeRoles();
            
            // Create super admin user
            initializeSuperAdminUser();
            
            // Create test project manager user
            //initializeTestProjectManagerUser();
            
            // Note: Employees, projects, timesheets, and cash flow will be created through the frontend
            
            logger.info("Data initialization completed successfully");
            
        } catch (Exception e) {
            logger.error("Error during data initialization: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    private void initializeRoles() {
        logger.debug("Initializing roles...");
        
        // Create SUPER_ADMIN role
        if (!roleRepository.findByName("SUPER_ADMIN").isPresent()) {
            Role superAdminRole = new Role();
            superAdminRole.setName("SUPER_ADMIN");
            roleRepository.save(superAdminRole);
            logger.info("Created role: SUPER_ADMIN");
        } else {
            logger.debug("Role SUPER_ADMIN already exists");
        }
        
        // Create ADMIN role
        if (!roleRepository.findByName("ADMIN").isPresent()) {
            Role adminRole = new Role();
            adminRole.setName("ADMIN");
            roleRepository.save(adminRole);
            logger.info("Created role: ADMIN");
        } else {
            logger.debug("Role ADMIN already exists");
        }
        
        // Create USER role
        if (!roleRepository.findByName("USER").isPresent()) {
            Role userRole = new Role();
            userRole.setName("USER");
            roleRepository.save(userRole);
            logger.info("Created role: USER");
        } else {
            logger.debug("Role USER already exists");
        }
        
        // Create HRMANAGER role
        if (!roleRepository.findByName("HRMANAGER").isPresent()) {
            Role hrManagerRole = new Role();
            hrManagerRole.setName("HRMANAGER");
            roleRepository.save(hrManagerRole);
            logger.info("Created role: HRMANAGER");
        } else {
            logger.debug("Role HRMANAGER already exists");
        }
        
        // Create PROJECTMGR role
        if (!roleRepository.findByName("PROJECTMGR").isPresent()) {
            Role projectMgrRole = new Role();
            projectMgrRole.setName("PROJECTMGR");
            roleRepository.save(projectMgrRole);
            logger.info("Created role: PROJECTMGR");
        } else {
            logger.debug("Role PROJECTMGR already exists");
        }
        
        // Create PROJECTMANAGER role
        if (!roleRepository.findByName("PROJECTMANAGER").isPresent()) {
            Role projectManagerRole = new Role();
            projectManagerRole.setName("PROJECTMANAGER");
            roleRepository.save(projectManagerRole);
            logger.info("Created role: PROJECTMANAGER");
        } else {
            logger.debug("Role PROJECTMANAGER already exists");
        }
    }
    
    private void initializeSuperAdminUser() {
        logger.debug("Initializing super admin user...");
        
        final String SUPER_ADMIN_USERNAME = "superadmin";
        final String SUPER_ADMIN_PASSWORD = "Admin@123!";
        
        if (!userRepository.findByUsername(SUPER_ADMIN_USERNAME).isPresent()) {
            
            // Get or create SUPER_ADMIN role
            Role superAdminRole = roleRepository.findByName("SUPER_ADMIN")
                .orElseThrow(() -> new RuntimeException("SUPER_ADMIN role not found"));
            
            // Create user
            User superAdminUser = new User();
            superAdminUser.setUsername(SUPER_ADMIN_USERNAME);
            
            // Encode password using BCrypt
            String encodedPassword = passwordEncoder.encode(SUPER_ADMIN_PASSWORD);
            superAdminUser.setPassword(encodedPassword);
            superAdminUser.setEnabled(true);
            
            // Add roles
            Set<Role> roles = new HashSet<>();
            roles.add(superAdminRole);
            superAdminUser.setRoles(roles);
            
            // Save user
            User savedUser = userRepository.save(superAdminUser);
            
            logger.info("=== SUPER ADMIN USER CREATED ===");
            logger.info("Username: {}", SUPER_ADMIN_USERNAME);
            logger.info("Password: {}", SUPER_ADMIN_PASSWORD);
            logger.info("Encoded Password: {}", encodedPassword);
            logger.info("User ID: {}", savedUser.getId());
            logger.info("Enabled: {}", savedUser.isEnabled());
            logger.info("Roles: {}", savedUser.getRoles().stream()
                .map(Role::getName)
                .toArray());
            logger.info("=================================");
            
            // Verification: Try to retrieve and log the saved user
            userRepository.findByUsername(SUPER_ADMIN_USERNAME).ifPresent(user -> {
                logger.debug("Verification - Retrieved user: username={}, enabled={}, password_length={}", 
                           user.getUsername(), user.isEnabled(), user.getPassword().length());
            });
            
        } else {
            logger.info("Super admin user '{}' already exists", SUPER_ADMIN_USERNAME);
            
            // Log existing user info for debugging
            userRepository.findByUsername(SUPER_ADMIN_USERNAME).ifPresent(user -> {
                logger.debug("Existing user: username={}, enabled={}, roles_count={}", 
                           user.getUsername(), user.isEnabled(), 
                           user.getRoles() != null ? user.getRoles().size() : 0);
            });
        }
    }
    
    private void initializeTestProjectManagerUser() {
        logger.debug("Initializing test project manager user...");
        
        final String PROJECT_MANAGER_USERNAME = "projectmanager";
        final String PROJECT_MANAGER_PASSWORD = "Manager@123!";
        
        if (!userRepository.findByUsername(PROJECT_MANAGER_USERNAME).isPresent()) {
            
            // Get or create PROJECTMANAGER role
            Role projectManagerRole = roleRepository.findByName("PROJECTMANAGER")
                .orElseThrow(() -> new RuntimeException("PROJECTMANAGER role not found"));
            
            // Create user
            User projectManagerUser = new User();
            projectManagerUser.setUsername(PROJECT_MANAGER_USERNAME);
            
            // Encode password using BCrypt
            String encodedPassword = passwordEncoder.encode(PROJECT_MANAGER_PASSWORD);
            projectManagerUser.setPassword(encodedPassword);
            projectManagerUser.setEnabled(true);
            
            // Add roles
            Set<Role> roles = new HashSet<>();
            roles.add(projectManagerRole);
            projectManagerUser.setRoles(roles);
            
            // Save user
            User savedUser = userRepository.save(projectManagerUser);
            
            logger.info("=== PROJECT MANAGER USER CREATED ===");
            logger.info("Username: {}", PROJECT_MANAGER_USERNAME);
            logger.info("Password: {}", PROJECT_MANAGER_PASSWORD);
            logger.info("User ID: {}", savedUser.getId());
            logger.info("Enabled: {}", savedUser.isEnabled());
            logger.info("Roles: {}", savedUser.getRoles().stream()
                .map(Role::getName)
                .toArray());
            logger.info("====================================");
            
        } else {
            logger.info("Project manager user '{}' already exists", PROJECT_MANAGER_USERNAME);
        }
    }
    
}