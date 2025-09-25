package org.erp.service;

import org.erp.entity.*;
import org.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;
import org.erp.controller.ProjectController;

@Service
@Transactional
public class ProjectService {
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private ProjectEmployeeRepository projectEmployeeRepository;
    
    @Autowired
    private TimesheetRepository timesheetRepository;
    
    @Autowired
    private EmployeeRepository employeeRepository;
    
    @Autowired
    private ProjectInventoryItemRepository projectInventoryItemRepository;
    
    public Project createProject(Project project) {
        return projectRepository.save(project);
    }
    
    public Project updateProject(Project project) {
        return projectRepository.save(project);
    }
    
    public void deleteProject(Long projectId) {
        projectRepository.deleteById(projectId);
    }
    
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }
    
    public Optional<Project> getProjectById(Long projectId) {
        return projectRepository.findById(projectId);
    }
    
    public List<Project> getActiveProjects() {
        return projectRepository.findActiveProjects(LocalDate.now());
    }
    
    public List<Project> getCompletedProjects() {
        return projectRepository.findCompletedProjects(LocalDate.now());
    }
    
    public List<Project> getUpcomingProjects() {
        return projectRepository.findUpcomingProjects(LocalDate.now());
    }
    
    public ProjectEmployee assignEmployeeToProject(Long projectId, Long employeeId, String roleInProject) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        ProjectEmployee projectEmployee = new ProjectEmployee(project, employee, LocalDate.now(), roleInProject);
        return projectEmployeeRepository.save(projectEmployee);
    }
    
    public void removeEmployeeFromProject(Long projectId, Long employeeId) {
        ProjectEmployee projectEmployee = projectEmployeeRepository.findByProjectIdAndEmployeeId(projectId, employeeId);
        if (projectEmployee != null) {
            projectEmployeeRepository.delete(projectEmployee);
        }
    }
    
    public List<ProjectEmployee> getProjectEmployees(Long projectId) {
        return projectEmployeeRepository.findByProjectId(projectId);
    }
    
    public Timesheet saveTimesheet(Long projectId, Long employeeId, LocalDate workDate, BigDecimal hoursWorked) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        Timesheet existingTimesheet = timesheetRepository.findByProjectEmployeeAndDate(projectId, employeeId, workDate);
        
        if (existingTimesheet != null) {
            existingTimesheet.setHoursWorked(hoursWorked);
            existingTimesheet.setHourlyRate(project.getPerHourRate());
            existingTimesheet.setDailyRate(project.getPerDayRate());
            existingTimesheet.setTotalAmount(calculateTotalAmount(hoursWorked, project.getPerHourRate(), project.getPerDayRate()));
            return timesheetRepository.save(existingTimesheet);
        } else {
            Timesheet timesheet = new Timesheet(project, employee, workDate, hoursWorked);
            timesheet.setHourlyRate(project.getPerHourRate());
            timesheet.setDailyRate(project.getPerDayRate());
            timesheet.setTotalAmount(calculateTotalAmount(hoursWorked, project.getPerHourRate(), project.getPerDayRate()));
            return timesheetRepository.save(timesheet);
        }
    }
    
    public List<Timesheet> getTimesheetsByProject(Long projectId) {
        return timesheetRepository.findByProjectId(projectId);
    }
    
    public List<Timesheet> getTimesheetsByProjectAndDateRange(Long projectId, LocalDate startDate, LocalDate endDate) {
        return timesheetRepository.findByProjectIdAndDateRange(projectId, startDate, endDate);
    }
    
    public BigDecimal calculateProjectTotalExpense(Long projectId) {
        List<Timesheet> timesheets = timesheetRepository.findByProjectId(projectId);
        return timesheets.stream()
                .map(Timesheet::getTotalAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    public Long getEmployeeCountForDate(Long projectId, LocalDate date) {
        return timesheetRepository.getEmployeeCountByProjectAndDate(projectId, date);
    }
    
    public Double getTotalHoursForDate(Long projectId, LocalDate date) {
        return timesheetRepository.getTotalHoursByProjectAndDate(projectId, date);
    }
    
    private BigDecimal calculateTotalAmount(BigDecimal hoursWorked, BigDecimal perHourRate, BigDecimal perDayRate) {
        if (hoursWorked == null || hoursWorked.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        
        if (perHourRate != null && perHourRate.compareTo(BigDecimal.ZERO) > 0) {
            return hoursWorked.multiply(perHourRate);
        }
        
        if (perDayRate != null && perDayRate.compareTo(BigDecimal.ZERO) > 0) {
            return perDayRate;
        }
        
        return BigDecimal.ZERO;
    }
    
    public boolean isTimesheetEditable(Long projectId, LocalDate date) {
        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) {
            return false;
        }
        
        Project project = projectOpt.get();
        LocalDate now = LocalDate.now();
        
        return !date.isBefore(project.getStartDate()) && 
               !date.isAfter(project.getEndDate()) && 
               !date.isAfter(now);
    }
    
    public ProjectController.ProjectExpenseBreakdown calculateProjectExpenseBreakdown(Long projectId) {
        // Calculate employee expenses
        List<Timesheet> timesheets = timesheetRepository.findByProjectId(projectId);
        BigDecimal employeeExpenses = timesheets.stream()
                .map(Timesheet::getTotalAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Calculate inventory expenses
        Double inventoryExpensesDouble = projectInventoryItemRepository.getTotalInventoryExpenseByProjectId(projectId);
        BigDecimal inventoryExpenses = inventoryExpensesDouble != null ? 
                BigDecimal.valueOf(inventoryExpensesDouble) : BigDecimal.ZERO;
        
        // For now, other expenses is zero (can be extended to include other expense types)
        BigDecimal otherExpenses = BigDecimal.ZERO;
        
        // Calculate total expense
        BigDecimal totalExpense = employeeExpenses.add(inventoryExpenses).add(otherExpenses);
        
        // Calculate employee expense details
        Map<Employee, List<Timesheet>> employeeTimesheets = timesheets.stream()
                .collect(Collectors.groupingBy(Timesheet::getEmployee));
        
        List<ProjectController.EmployeeExpenseDetail> employeeExpenseDetails = employeeTimesheets.entrySet()
                .stream()
                .map(entry -> {
                    Employee employee = entry.getKey();
                    List<Timesheet> empTimesheets = entry.getValue();
                    
                    BigDecimal empTotalExpense = empTimesheets.stream()
                            .map(Timesheet::getTotalAmount)
                            .filter(amount -> amount != null)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    
                    Double totalHours = empTimesheets.stream()
                            .map(Timesheet::getHoursWorked)
                            .filter(hours -> hours != null)
                            .map(BigDecimal::doubleValue)
                            .reduce(0.0, Double::sum);
                    
                    Integer totalDaysWorked = empTimesheets.size();
                    
                    return new ProjectController.EmployeeExpenseDetail(
                            employee.getName(),
                            employee.getEmpId(),
                            empTotalExpense,
                            totalHours,
                            totalDaysWorked
                    );
                })
                .collect(Collectors.toList());
        
        return new ProjectController.ProjectExpenseBreakdown(
                totalExpense,
                employeeExpenses,
                inventoryExpenses,
                otherExpenses,
                employeeExpenseDetails
        );
    }
}