package org.erp.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "projects")
public class Project {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private LocalDate startDate;
    
    @Column(nullable = false)
    private LocalDate endDate;
    
    @Column(nullable = false)
    private String projectType;
    
    @Column(nullable = false)
    private String projectStage;
    
    @Column(length = 1000)
    private String projectDescription;
    
    @Column(precision = 15, scale = 2)
    private BigDecimal projectBudget;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal perDayRate;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal perHourRate;
    
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("project-employees")
    private List<ProjectEmployee> projectEmployees;
    
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("project-timesheets")
    private List<Timesheet> timesheets;
    
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("project-inventory-items")
    private List<ProjectInventoryItem> projectInventoryItems;
    
    public Project() {}
    
    public Project(LocalDate startDate, LocalDate endDate, String projectType, String projectStage, String projectDescription, 
                  BigDecimal projectBudget, BigDecimal perDayRate, BigDecimal perHourRate) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.projectType = projectType;
        this.projectStage = projectStage;
        this.projectDescription = projectDescription;
        this.projectBudget = projectBudget;
        this.perDayRate = perDayRate;
        this.perHourRate = perHourRate;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public LocalDate getStartDate() {
        return startDate;
    }
    
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }
    
    public LocalDate getEndDate() {
        return endDate;
    }
    
    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
    
    public String getProjectType() {
        return projectType;
    }
    
    public void setProjectType(String projectType) {
        this.projectType = projectType;
    }
    
    public String getProjectStage() {
        return projectStage;
    }
    
    public void setProjectStage(String projectStage) {
        this.projectStage = projectStage;
    }
    
    public String getProjectDescription() {
        return projectDescription;
    }
    
    public void setProjectDescription(String projectDescription) {
        this.projectDescription = projectDescription;
    }
    
    public BigDecimal getProjectBudget() {
        return projectBudget;
    }
    
    public void setProjectBudget(BigDecimal projectBudget) {
        this.projectBudget = projectBudget;
    }
    
    public BigDecimal getPerDayRate() {
        return perDayRate;
    }
    
    public void setPerDayRate(BigDecimal perDayRate) {
        this.perDayRate = perDayRate;
    }
    
    public BigDecimal getPerHourRate() {
        return perHourRate;
    }
    
    public void setPerHourRate(BigDecimal perHourRate) {
        this.perHourRate = perHourRate;
    }
    
    public List<ProjectEmployee> getProjectEmployees() {
        return projectEmployees;
    }
    
    public void setProjectEmployees(List<ProjectEmployee> projectEmployees) {
        this.projectEmployees = projectEmployees;
    }
    
    public List<Timesheet> getTimesheets() {
        return timesheets;
    }
    
    public void setTimesheets(List<Timesheet> timesheets) {
        this.timesheets = timesheets;
    }
    
    public List<ProjectInventoryItem> getProjectInventoryItems() {
        return projectInventoryItems;
    }
    
    public void setProjectInventoryItems(List<ProjectInventoryItem> projectInventoryItems) {
        this.projectInventoryItems = projectInventoryItems;
    }
}