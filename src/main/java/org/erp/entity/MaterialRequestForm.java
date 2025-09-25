package org.erp.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "material_request_forms")
public class MaterialRequestForm {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "mrf_number", unique = true, nullable = false)
    private String mrfNumber;
    
    @Column(name = "requestor_name", nullable = false)
    private String requestorName;
    
    @Column(name = "requestor_department")
    private String requestorDepartment;
    
    @Column(name = "requestor_employee_id")
    private String requestorEmployeeId;
    
    @Column(name = "reason_justification", columnDefinition = "TEXT")
    private String reasonJustification;
    
    @Column(name = "total_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal totalAmount;
    
    @Column(name = "creation_date", nullable = false)
    private LocalDateTime creationDate;
    
    @Column(name = "approval_date")
    private LocalDateTime approvalDate;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private MRFStatus status;
    
    @Column(name = "requested_by", nullable = false)
    private String requestedBy;
    
    @Column(name = "approved_by")
    private String approvedBy;
    
    @Column(name = "rejection_reason")
    private String rejectionReason;
    
    @Column(name = "requires_superadmin", nullable = false)
    private Boolean requiresSuperadmin = false;
    
    @OneToMany(mappedBy = "materialRequestForm", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MRFItem> items = new ArrayList<>();
    
    public enum MRFStatus {
        PENDING, APPROVED, REJECTED
    }
    
    public MaterialRequestForm() {
        this.creationDate = LocalDateTime.now();
        this.status = MRFStatus.PENDING;
    }
    
    public MaterialRequestForm(String requestorName, String requestedBy) {
        this();
        this.requestorName = requestorName;
        this.requestedBy = requestedBy;
    }
    
    @PrePersist
    @PreUpdate
    public void calculateTotalAndDetermineApprover() {
        calculateTotalAmount();
        determineApprovalLevel();
    }
    
    private void calculateTotalAmount() {
        if (items != null && !items.isEmpty()) {
            this.totalAmount = items.stream()
                    .map(MRFItem::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        } else {
            this.totalAmount = BigDecimal.ZERO;
        }
    }
    
    private void determineApprovalLevel() {
        if (totalAmount != null) {
            this.requiresSuperadmin = totalAmount.compareTo(new BigDecimal("2000")) >= 0;
        }
    }
    
    public void addItem(MRFItem item) {
        items.add(item);
        item.setMaterialRequestForm(this);
        calculateTotalAmount();
        determineApprovalLevel();
    }
    
    public void removeItem(MRFItem item) {
        items.remove(item);
        item.setMaterialRequestForm(null);
        calculateTotalAmount();
        determineApprovalLevel();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getMrfNumber() {
        return mrfNumber;
    }
    
    public void setMrfNumber(String mrfNumber) {
        this.mrfNumber = mrfNumber;
    }
    
    public String getRequestorName() {
        return requestorName;
    }
    
    public void setRequestorName(String requestorName) {
        this.requestorName = requestorName;
    }
    
    public String getRequestorDepartment() {
        return requestorDepartment;
    }
    
    public void setRequestorDepartment(String requestorDepartment) {
        this.requestorDepartment = requestorDepartment;
    }
    
    public String getRequestorEmployeeId() {
        return requestorEmployeeId;
    }
    
    public void setRequestorEmployeeId(String requestorEmployeeId) {
        this.requestorEmployeeId = requestorEmployeeId;
    }
    
    public String getReasonJustification() {
        return reasonJustification;
    }
    
    public void setReasonJustification(String reasonJustification) {
        this.reasonJustification = reasonJustification;
    }
    
    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
        determineApprovalLevel();
    }
    
    public LocalDateTime getCreationDate() {
        return creationDate;
    }
    
    public void setCreationDate(LocalDateTime creationDate) {
        this.creationDate = creationDate;
    }
    
    public LocalDateTime getApprovalDate() {
        return approvalDate;
    }
    
    public void setApprovalDate(LocalDateTime approvalDate) {
        this.approvalDate = approvalDate;
    }
    
    public MRFStatus getStatus() {
        return status;
    }
    
    public void setStatus(MRFStatus status) {
        this.status = status;
    }
    
    public String getRequestedBy() {
        return requestedBy;
    }
    
    public void setRequestedBy(String requestedBy) {
        this.requestedBy = requestedBy;
    }
    
    public String getApprovedBy() {
        return approvedBy;
    }
    
    public void setApprovedBy(String approvedBy) {
        this.approvedBy = approvedBy;
    }
    
    public String getRejectionReason() {
        return rejectionReason;
    }
    
    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
    
    public Boolean getRequiresSuperadmin() {
        return requiresSuperadmin;
    }
    
    public void setRequiresSuperadmin(Boolean requiresSuperadmin) {
        this.requiresSuperadmin = requiresSuperadmin;
    }
    
    public List<MRFItem> getItems() {
        return items;
    }
    
    public void setItems(List<MRFItem> items) {
        this.items = items;
        if (items != null) {
            for (MRFItem item : items) {
                item.setMaterialRequestForm(this);
            }
        }
        calculateTotalAmount();
        determineApprovalLevel();
    }
}