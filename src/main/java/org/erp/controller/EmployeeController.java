package org.erp.controller;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.erp.entity.Employee;
import org.erp.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/employees")
@PreAuthorize("hasRole('HRMANAGER')")
public class EmployeeController {

    private static final Logger logger = LogManager.getLogger(EmployeeController.class);
    
    @Autowired
    private EmployeeRepository employeeRepository;

    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> getAllEmployees() {
        logger.debug("Fetching all employees");
        
        try {
            List<Employee> employees = employeeRepository.findAll();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("employees", employees);
            
            logger.debug("Successfully fetched {} employees", employees.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error fetching employees: {}", e.getMessage(), e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Failed to fetch employees");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/{empId}")
    public ResponseEntity<Map<String, Object>> getEmployeeByEmpId(@PathVariable String empId) {
        logger.info("Fetching employee details for empId: {}", empId);
        
        Optional<Employee> employeeOptional = employeeRepository.findByEmpId(empId);
        Map<String, Object> response = new HashMap<>();
        
        if (employeeOptional.isPresent()) {
            Employee employee = employeeOptional.get();
            response.put("success", true);
            response.put("employee", employee);
            logger.debug("Employee found: {}", empId);
            return ResponseEntity.ok(response);
        } else {
            logger.warn("Employee not found: {}", empId);
            response.put("success", false);
            response.put("error", "Employee not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createEmployee(@RequestBody CreateEmployeeRequest request) {
        logger.info("Creating new employee: {}", request.getName());
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validate input
            if (request.getName() == null || request.getName().trim().isEmpty()) {
                response.put("success", false);
                response.put("error", "Name is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (request.getEmpId() == null || request.getEmpId().trim().isEmpty()) {
                response.put("success", false);
                response.put("error", "Employee ID is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (request.getPassportId() == null || request.getPassportId().trim().isEmpty()) {
                response.put("success", false);
                response.put("error", "Passport ID is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (request.getEmiratesId() == null || request.getEmiratesId().trim().isEmpty()) {
                response.put("success", false);
                response.put("error", "Emirates ID is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (request.getPhoneNumber() == null || request.getPhoneNumber().trim().isEmpty()) {
                response.put("success", false);
                response.put("error", "Phone number is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (request.getJoiningDate() == null) {
                response.put("success", false);
                response.put("error", "Joining date is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (request.getSalary() == null || request.getSalary().compareTo(BigDecimal.ZERO) <= 0) {
                response.put("success", false);
                response.put("error", "Valid salary is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Check if employee ID already exists
            if (employeeRepository.existsByEmpId(request.getEmpId())) {
                response.put("success", false);
                response.put("error", "Employee ID already exists");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Check if passport ID already exists
            if (employeeRepository.existsByPassportId(request.getPassportId())) {
                response.put("success", false);
                response.put("error", "Passport ID already exists");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Check if emirates ID already exists
            if (employeeRepository.existsByEmiratesId(request.getEmiratesId())) {
                response.put("success", false);
                response.put("error", "Emirates ID already exists");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Create new employee
            Employee newEmployee = new Employee();
            newEmployee.setName(request.getName().trim());
            newEmployee.setEmpId(request.getEmpId().trim());
            newEmployee.setPassportId(request.getPassportId().trim());
            newEmployee.setEmiratesId(request.getEmiratesId().trim());
            newEmployee.setPhoneNumber(request.getPhoneNumber().trim());
            newEmployee.setJoiningDate(request.getJoiningDate());
            newEmployee.setEndDate(request.getEndDate());
            newEmployee.setSalary(request.getSalary());
            newEmployee.setComments(request.getComments() != null ? request.getComments().trim() : null);
            
            // Save employee
            Employee savedEmployee = employeeRepository.save(newEmployee);
            
            response.put("success", true);
            response.put("message", "Employee created successfully");
            response.put("employee", savedEmployee);
            
            logger.info("Successfully created employee: {} with ID: {}", 
                       savedEmployee.getName(), savedEmployee.getEmpId());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error creating employee: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "Failed to create employee");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateEmployee(
            @PathVariable Long id,
            @RequestBody UpdateEmployeeRequest request) {
        
        logger.info("Updating employee with id: {}", id);
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<Employee> employeeOptional = employeeRepository.findById(id);
            
            if (employeeOptional.isEmpty()) {
                logger.warn("Employee not found with id: {}", id);
                response.put("success", false);
                response.put("error", "Employee not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            Employee employee = employeeOptional.get();
            
            // Update fields if provided
            if (request.getName() != null && !request.getName().trim().isEmpty()) {
                employee.setName(request.getName().trim());
            }
            
            if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
                employee.setPhoneNumber(request.getPhoneNumber().trim());
            }
            
            if (request.getSalary() != null && request.getSalary().compareTo(BigDecimal.ZERO) > 0) {
                employee.setSalary(request.getSalary());
            }
            
            if (request.getEndDate() != null) {
                employee.setEndDate(request.getEndDate());
            }
            
            if (request.getComments() != null) {
                employee.setComments(request.getComments().trim());
            }
            
            // Save updated employee
            Employee updatedEmployee = employeeRepository.save(employee);
            
            response.put("success", true);
            response.put("message", "Employee updated successfully");
            response.put("employee", updatedEmployee);
            
            logger.info("Employee updated successfully: {}", updatedEmployee.getName());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error updating employee: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "Failed to update employee");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/{empId}")
    public ResponseEntity<Map<String, Object>> deleteEmployee(@PathVariable String empId) {
        logger.info("Deleting employee: {}", empId);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<Employee> employeeOptional = employeeRepository.findByEmpId(empId);
            
            if (employeeOptional.isEmpty()) {
                logger.warn("Employee not found for deletion: {}", empId);
                response.put("success", false);
                response.put("error", "Employee not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            Employee employee = employeeOptional.get();
            employeeRepository.delete(employee);
            
            response.put("success", true);
            response.put("message", "Employee deleted successfully");
            response.put("empId", empId);
            
            logger.info("Successfully deleted employee: {}", empId);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error deleting employee: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "Failed to delete employee");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Request DTOs
    public static class CreateEmployeeRequest {
        private String name;
        private String empId;
        private String passportId;
        private String emiratesId;
        private String phoneNumber;
        private LocalDate joiningDate;
        private LocalDate endDate;
        private BigDecimal salary;
        private String comments;

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getEmpId() { return empId; }
        public void setEmpId(String empId) { this.empId = empId; }
        
        public String getPassportId() { return passportId; }
        public void setPassportId(String passportId) { this.passportId = passportId; }
        
        public String getEmiratesId() { return emiratesId; }
        public void setEmiratesId(String emiratesId) { this.emiratesId = emiratesId; }
        
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
        
        public LocalDate getJoiningDate() { return joiningDate; }
        public void setJoiningDate(LocalDate joiningDate) { this.joiningDate = joiningDate; }
        
        public LocalDate getEndDate() { return endDate; }
        public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
        
        public BigDecimal getSalary() { return salary; }
        public void setSalary(BigDecimal salary) { this.salary = salary; }
        
        public String getComments() { return comments; }
        public void setComments(String comments) { this.comments = comments; }
    }

    public static class UpdateEmployeeRequest {
        private String name;
        private String phoneNumber;
        private LocalDate endDate;
        private BigDecimal salary;
        private String comments;

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
        
        public LocalDate getEndDate() { return endDate; }
        public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
        
        public BigDecimal getSalary() { return salary; }
        public void setSalary(BigDecimal salary) { this.salary = salary; }
        
        public String getComments() { return comments; }
        public void setComments(String comments) { this.comments = comments; }
    }
}