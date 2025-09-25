package org.erp.service;

import org.erp.entity.*;
import org.erp.entity.EmployeeRequest.RequestStatus;
import org.erp.entity.Notification.NotificationType;
import org.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@Transactional
public class EmployeeRequestService {

    @Autowired
    private EmployeeRequestRepository employeeRequestRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public EmployeeRequest createEmployeeRequest(EmployeeRequest request, User requestedBy, MultipartFile file) {
        request.setRequestedBy(requestedBy);
        request.setStatus(RequestStatus.PENDING);
        request.setCreatedAt(LocalDateTime.now());

        validateUniqueFields(request);

        // Save file if provided
        if (file != null && !file.isEmpty()) {
            try {
                String filePath = saveJoiningDocsFile(file, request.getPassportId(), request.getName());
                request.setJoiningDocsPath(filePath);
            } catch (IOException e) {
                throw new RuntimeException("Failed to save joining documents: " + e.getMessage());
            }
        }

        EmployeeRequest savedRequest = employeeRequestRepository.save(request);

        notifySuperAdmins(savedRequest);

        return savedRequest;
    }
    
    private String saveJoiningDocsFile(MultipartFile file, String passportId, String employeeName) throws IOException {
        // Validate file is ZIP
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".zip")) {
            throw new RuntimeException("Only ZIP files are allowed");
        }
        
        // Standard file size limit (e.g., 10MB)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new RuntimeException("File size must not exceed 10MB");
        }
        
        // Create directory structure: uploads/doc/YYYY-MM-DD/PASSPORT_EmployeeName/
        String dateFolder = LocalDate.now().toString();
        String passportFolder = passportId + "_" + employeeName.replaceAll("[^a-zA-Z0-9]", "_");
        
        // Use relative path from project root
        Path uploadPath = Paths.get("uploads", "doc", dateFolder, passportFolder);
        
        // Create directories if they don't exist
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to create upload directory: " + e.getMessage());
        }
        
        // Save file with original name
        Path filePath = uploadPath.resolve(filename);
        try {
            Files.write(filePath, file.getBytes());
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file: " + e.getMessage());
        }
        
        // Return relative path for storage in database
        return "uploads/doc/" + dateFolder + "/" + passportFolder + "/" + filename;
    }

    public String getEmployeeJoiningDocsPath(Long employeeId) {
        // First check if the employee exists
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));
        
        // Return the joining docs path
        return employee.getJoiningDocsPath();
    }

    private void validateUniqueFields(EmployeeRequest request) {
        List<RequestStatus> activeStatuses = Arrays.asList(RequestStatus.PENDING, RequestStatus.APPROVED);

        if (employeeRequestRepository.existsByEmpIdAndStatusIn(request.getEmpId(), activeStatuses) ||
            employeeRepository.existsByEmpId(request.getEmpId())) {
            throw new RuntimeException("Employee ID already exists or has a pending request");
        }

        if (employeeRequestRepository.existsByPassportIdAndStatusIn(request.getPassportId(), activeStatuses) ||
            employeeRepository.existsByPassportId(request.getPassportId())) {
            throw new RuntimeException("Passport ID already exists or has a pending request");
        }

        if (employeeRequestRepository.existsByEmiratesIdAndStatusIn(request.getEmiratesId(), activeStatuses) ||
            employeeRepository.existsByEmiratesId(request.getEmiratesId())) {
            throw new RuntimeException("Emirates ID already exists or has a pending request");
        }
    }

    private void notifySuperAdmins(EmployeeRequest request) {
        List<User> superAdmins = userRepository.findByRolesName("SUPER_ADMIN");
        for (User superAdmin : superAdmins) {
            Notification notification = new Notification();
            notification.setRecipient(superAdmin);
            notification.setTitle("New Employee Request");
            notification.setMessage("HR Manager " + request.getRequestedBy().getUsername() + 
                                  " has requested to create employee: " + request.getName());
            notification.setType(NotificationType.EMPLOYEE_REQUEST_CREATED);
            notification.setRelatedEmployeeRequest(request);
            notificationRepository.save(notification);
        }
    }

    public List<EmployeeRequest> getPendingRequests() {
        return employeeRequestRepository.findByStatus(RequestStatus.PENDING);
    }

    public List<EmployeeRequest> getRequestsByHRManager(User hrManager) {
        return employeeRequestRepository.findByRequestedBy(hrManager);
    }

    @Transactional
    public EmployeeRequest approveRequest(Long requestId, User approvedBy) {
        EmployeeRequest request = employeeRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Request not found"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new RuntimeException("Request is not in pending status");
        }

        request.setStatus(RequestStatus.APPROVED);
        request.setApprovedBy(approvedBy);
        request.setProcessedAt(LocalDateTime.now());

        Employee employee = createEmployeeFromRequest(request);
        employeeRepository.save(employee);

        EmployeeRequest updatedRequest = employeeRequestRepository.save(request);

        notifyHRManager(request, true, null);

        return updatedRequest;
    }

    @Transactional
    public EmployeeRequest rejectRequest(Long requestId, User rejectedBy, String reason) {
        EmployeeRequest request = employeeRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Request not found"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new RuntimeException("Request is not in pending status");
        }

        request.setStatus(RequestStatus.REJECTED);
        request.setApprovedBy(rejectedBy);
        request.setRejectionReason(reason);
        request.setProcessedAt(LocalDateTime.now());

        EmployeeRequest updatedRequest = employeeRequestRepository.save(request);

        notifyHRManager(request, false, reason);

        return updatedRequest;
    }

    private Employee createEmployeeFromRequest(EmployeeRequest request) {
        Employee employee = new Employee();
        employee.setName(request.getName());
        employee.setEmpId(request.getEmpId());
        employee.setPassportId(request.getPassportId());
        employee.setJoiningDate(request.getJoiningDate());
        employee.setEndDate(request.getEndDate());
        employee.setSalary(request.getSalary());
        employee.setEmiratesId(request.getEmiratesId());
        employee.setPhoneNumber(request.getPhoneNumber());
        employee.setComments(request.getComments());
        employee.setJoiningDocsPath(request.getJoiningDocsPath());
        return employee;
    }

    private void notifyHRManager(EmployeeRequest request, boolean approved, String reason) {
        Notification notification = new Notification();
        notification.setRecipient(request.getRequestedBy());
        notification.setRelatedEmployeeRequest(request);

        if (approved) {
            notification.setTitle("Employee Request Approved");
            notification.setMessage("Your request to create employee " + request.getName() + 
                                  " has been approved by " + request.getApprovedBy().getUsername());
            notification.setType(NotificationType.EMPLOYEE_REQUEST_APPROVED);
        } else {
            notification.setTitle("Employee Request Rejected");
            notification.setMessage("Your request to create employee " + request.getName() + 
                                  " has been rejected by " + request.getApprovedBy().getUsername() +
                                  ". Reason: " + reason);
            notification.setType(NotificationType.EMPLOYEE_REQUEST_REJECTED);
        }

        notificationRepository.save(notification);
    }

    public EmployeeRequest getRequestById(Long id) {
        return employeeRequestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Request not found"));
    }
}