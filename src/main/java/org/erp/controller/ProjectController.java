package org.erp.controller;

import org.erp.entity.*;
import org.erp.service.ProjectService;
import org.erp.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:3000")
public class ProjectController {
    
    @Autowired
    private ProjectService projectService;
    
    @Autowired
    private EmployeeRepository employeeRepository;
    
    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody Project project) {
        try {
            Project savedProject = projectService.createProject(project);
            return ResponseEntity.ok(savedProject);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @RequestBody Project project) {
        try {
            project.setId(id);
            Project updatedProject = projectService.updateProject(project);
            return ResponseEntity.ok(updatedProject);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        try {
            projectService.deleteProject(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects() {
        List<Project> projects = projectService.getAllProjects();
        return ResponseEntity.ok(projects);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        Optional<Project> project = projectService.getProjectById(id);
        return project.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<Project>> getActiveProjects() {
        List<Project> projects = projectService.getActiveProjects();
        return ResponseEntity.ok(projects);
    }
    
    @GetMapping("/completed")
    public ResponseEntity<List<Project>> getCompletedProjects() {
        List<Project> projects = projectService.getCompletedProjects();
        return ResponseEntity.ok(projects);
    }
    
    @GetMapping("/upcoming")
    public ResponseEntity<List<Project>> getUpcomingProjects() {
        List<Project> projects = projectService.getUpcomingProjects();
        return ResponseEntity.ok(projects);
    }
    
    @PostMapping("/{projectId}/employees/{employeeId}")
    public ResponseEntity<ProjectEmployee> assignEmployeeToProject(
            @PathVariable Long projectId, 
            @PathVariable Long employeeId,
            @RequestParam(required = false) String roleInProject) {
        try {
            ProjectEmployee projectEmployee = projectService.assignEmployeeToProject(projectId, employeeId, roleInProject);
            return ResponseEntity.ok(projectEmployee);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{projectId}/employees/{employeeId}")
    public ResponseEntity<Void> removeEmployeeFromProject(
            @PathVariable Long projectId, 
            @PathVariable Long employeeId) {
        try {
            projectService.removeEmployeeFromProject(projectId, employeeId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{projectId}/employees")
    public ResponseEntity<List<ProjectEmployee>> getProjectEmployees(@PathVariable Long projectId) {
        List<ProjectEmployee> projectEmployees = projectService.getProjectEmployees(projectId);
        return ResponseEntity.ok(projectEmployees);
    }
    
    @GetMapping("/employees")
    public ResponseEntity<List<Employee>> getAllEmployeesForProjects() {
        try {
            List<Employee> employees = employeeRepository.findAll();
            return ResponseEntity.ok(employees);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{projectId}/timesheet")
    public ResponseEntity<Timesheet> saveTimesheet(
            @PathVariable Long projectId,
            @RequestParam Long employeeId,
            @RequestParam String workDate,
            @RequestParam BigDecimal hoursWorked) {
        try {
            LocalDate date = LocalDate.parse(workDate);
            Timesheet timesheet = projectService.saveTimesheet(projectId, employeeId, date, hoursWorked);
            return ResponseEntity.ok(timesheet);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{projectId}/timesheet")
    public ResponseEntity<List<Timesheet>> getProjectTimesheets(@PathVariable Long projectId) {
        List<Timesheet> timesheets = projectService.getTimesheetsByProject(projectId);
        return ResponseEntity.ok(timesheets);
    }
    
    @GetMapping("/{projectId}/timesheet/range")
    public ResponseEntity<List<Timesheet>> getProjectTimesheetsByDateRange(
            @PathVariable Long projectId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            List<Timesheet> timesheets = projectService.getTimesheetsByProjectAndDateRange(projectId, start, end);
            return ResponseEntity.ok(timesheets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{projectId}/expense")
    public ResponseEntity<BigDecimal> getProjectTotalExpense(@PathVariable Long projectId) {
        BigDecimal totalExpense = projectService.calculateProjectTotalExpense(projectId);
        return ResponseEntity.ok(totalExpense);
    }
    
    @GetMapping("/{projectId}/expense/breakdown")
    public ResponseEntity<ProjectExpenseBreakdown> getProjectExpenseBreakdown(@PathVariable Long projectId) {
        try {
            ProjectExpenseBreakdown breakdown = projectService.calculateProjectExpenseBreakdown(projectId);
            return ResponseEntity.ok(breakdown);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{projectId}/stats/date/{date}")
    public ResponseEntity<DailyProjectStats> getDailyProjectStats(
            @PathVariable Long projectId, 
            @PathVariable String date) {
        try {
            LocalDate workDate = LocalDate.parse(date);
            Long employeeCount = projectService.getEmployeeCountForDate(projectId, workDate);
            Double totalHours = projectService.getTotalHoursForDate(projectId, workDate);
            
            DailyProjectStats stats = new DailyProjectStats(workDate, employeeCount, totalHours);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{projectId}/timesheet/editable/{date}")
    public ResponseEntity<Boolean> isTimesheetEditable(
            @PathVariable Long projectId, 
            @PathVariable String date) {
        try {
            LocalDate workDate = LocalDate.parse(date);
            boolean editable = projectService.isTimesheetEditable(projectId, workDate);
            return ResponseEntity.ok(editable);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    public static class DailyProjectStats {
        private LocalDate date;
        private Long employeeCount;
        private Double totalHours;
        
        public DailyProjectStats(LocalDate date, Long employeeCount, Double totalHours) {
            this.date = date;
            this.employeeCount = employeeCount;
            this.totalHours = totalHours;
        }
        
        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }
        public Long getEmployeeCount() { return employeeCount; }
        public void setEmployeeCount(Long employeeCount) { this.employeeCount = employeeCount; }
        public Double getTotalHours() { return totalHours; }
        public void setTotalHours(Double totalHours) { this.totalHours = totalHours; }
    }
    
    public static class ProjectExpenseBreakdown {
        private BigDecimal totalExpense;
        private BigDecimal employeeExpenses;
        private BigDecimal inventoryExpenses;
        private BigDecimal otherExpenses;
        private List<EmployeeExpenseDetail> employeeExpenseDetails;
        
        public ProjectExpenseBreakdown(BigDecimal totalExpense, BigDecimal employeeExpenses, 
                                     BigDecimal inventoryExpenses, BigDecimal otherExpenses,
                                     List<EmployeeExpenseDetail> employeeExpenseDetails) {
            this.totalExpense = totalExpense;
            this.employeeExpenses = employeeExpenses;
            this.inventoryExpenses = inventoryExpenses;
            this.otherExpenses = otherExpenses;
            this.employeeExpenseDetails = employeeExpenseDetails;
        }
        
        public BigDecimal getTotalExpense() { return totalExpense; }
        public void setTotalExpense(BigDecimal totalExpense) { this.totalExpense = totalExpense; }
        public BigDecimal getEmployeeExpenses() { return employeeExpenses; }
        public void setEmployeeExpenses(BigDecimal employeeExpenses) { this.employeeExpenses = employeeExpenses; }
        public BigDecimal getInventoryExpenses() { return inventoryExpenses; }
        public void setInventoryExpenses(BigDecimal inventoryExpenses) { this.inventoryExpenses = inventoryExpenses; }
        public BigDecimal getOtherExpenses() { return otherExpenses; }
        public void setOtherExpenses(BigDecimal otherExpenses) { this.otherExpenses = otherExpenses; }
        public List<EmployeeExpenseDetail> getEmployeeExpenseDetails() { return employeeExpenseDetails; }
        public void setEmployeeExpenseDetails(List<EmployeeExpenseDetail> employeeExpenseDetails) { this.employeeExpenseDetails = employeeExpenseDetails; }
    }
    
    public static class EmployeeExpenseDetail {
        private String employeeName;
        private String empId;
        private BigDecimal totalExpense;
        private Double totalHours;
        private Integer totalDaysWorked;
        
        public EmployeeExpenseDetail(String employeeName, String empId, BigDecimal totalExpense, 
                                   Double totalHours, Integer totalDaysWorked) {
            this.employeeName = employeeName;
            this.empId = empId;
            this.totalExpense = totalExpense;
            this.totalHours = totalHours;
            this.totalDaysWorked = totalDaysWorked;
        }
        
        public String getEmployeeName() { return employeeName; }
        public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }
        public String getEmpId() { return empId; }
        public void setEmpId(String empId) { this.empId = empId; }
        public BigDecimal getTotalExpense() { return totalExpense; }
        public void setTotalExpense(BigDecimal totalExpense) { this.totalExpense = totalExpense; }
        public Double getTotalHours() { return totalHours; }
        public void setTotalHours(Double totalHours) { this.totalHours = totalHours; }
        public Integer getTotalDaysWorked() { return totalDaysWorked; }
        public void setTotalDaysWorked(Integer totalDaysWorked) { this.totalDaysWorked = totalDaysWorked; }
    }
}