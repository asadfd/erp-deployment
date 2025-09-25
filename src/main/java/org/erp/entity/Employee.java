package org.erp.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "employees")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Employee {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(name = "emp_id", nullable = false, unique = true)
    private String empId;
    
    @Column(name = "passport_id", nullable = false, unique = true)
    private String passportId;
    
    @Column(name = "joining_date", nullable = false)
    private LocalDate joiningDate;
    
    @Column(name = "end_date")
    private LocalDate endDate;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal salary;
    
    @Column(name = "emirates_id", nullable = false, unique = true)
    private String emiratesId;
    
    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;
    
    @Column(columnDefinition = "TEXT")
    private String comments;
    
    @Column(name = "joining_docs_path")
    private String joiningDocsPath;
    
    // Default constructor
    public Employee() {}
    
    // Constructor with required fields
    public Employee(String name, String empId, String passportId, LocalDate joiningDate, 
                   BigDecimal salary, String emiratesId, String phoneNumber) {
        this.name = name;
        this.empId = empId;
        this.passportId = passportId;
        this.joiningDate = joiningDate;
        this.salary = salary;
        this.emiratesId = emiratesId;
        this.phoneNumber = phoneNumber;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getEmpId() {
        return empId;
    }
    
    public void setEmpId(String empId) {
        this.empId = empId;
    }
    
    public String getPassportId() {
        return passportId;
    }
    
    public void setPassportId(String passportId) {
        this.passportId = passportId;
    }
    
    public LocalDate getJoiningDate() {
        return joiningDate;
    }
    
    public void setJoiningDate(LocalDate joiningDate) {
        this.joiningDate = joiningDate;
    }
    
    public LocalDate getEndDate() {
        return endDate;
    }
    
    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
    
    public BigDecimal getSalary() {
        return salary;
    }
    
    public void setSalary(BigDecimal salary) {
        this.salary = salary;
    }
    
    public String getEmiratesId() {
        return emiratesId;
    }
    
    public void setEmiratesId(String emiratesId) {
        this.emiratesId = emiratesId;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public String getComments() {
        return comments;
    }
    
    public void setComments(String comments) {
        this.comments = comments;
    }
    
    public String getJoiningDocsPath() {
        return joiningDocsPath;
    }
    
    public void setJoiningDocsPath(String joiningDocsPath) {
        this.joiningDocsPath = joiningDocsPath;
    }
    
    @Override
    public String toString() {
        return "Employee{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", empId='" + empId + '\'' +
                ", passportId='" + passportId + '\'' +
                ", joiningDate=" + joiningDate +
                ", endDate=" + endDate +
                ", salary=" + salary +
                ", emiratesId='" + emiratesId + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", comments='" + comments + '\'' +
                ", joiningDocsPath='" + joiningDocsPath + '\'' +
                '}';
    }
}