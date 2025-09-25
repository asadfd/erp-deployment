package org.erp.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "project_employees")
public class ProjectEmployee {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonBackReference("project-employees")
    private Project project;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;
    
    @Column(name = "assigned_date", nullable = false)
    private LocalDate assignedDate;
    
    @Column(name = "role_in_project")
    private String roleInProject;
    
    public ProjectEmployee() {}
    
    public ProjectEmployee(Project project, Employee employee, LocalDate assignedDate) {
        this.project = project;
        this.employee = employee;
        this.assignedDate = assignedDate;
    }
    
    public ProjectEmployee(Project project, Employee employee, LocalDate assignedDate, String roleInProject) {
        this.project = project;
        this.employee = employee;
        this.assignedDate = assignedDate;
        this.roleInProject = roleInProject;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Project getProject() {
        return project;
    }
    
    public void setProject(Project project) {
        this.project = project;
    }
    
    public Employee getEmployee() {
        return employee;
    }
    
    public void setEmployee(Employee employee) {
        this.employee = employee;
    }
    
    public LocalDate getAssignedDate() {
        return assignedDate;
    }
    
    public void setAssignedDate(LocalDate assignedDate) {
        this.assignedDate = assignedDate;
    }
    
    public String getRoleInProject() {
        return roleInProject;
    }
    
    public void setRoleInProject(String roleInProject) {
        this.roleInProject = roleInProject;
    }
}