package org.erp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "purchase_orders")
public class PurchaseOrder {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "po_number", unique = true, nullable = false)
    private String poNumber;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnore
    private Project project;
    
    @Column(name = "supplier_name", nullable = false)
    private String supplierName;
    
    @Column(name = "supplier_contact")
    private String supplierContact;
    
    @Column(name = "supplier_email")
    private String supplierEmail;
    
    @Column(name = "supplier_address")
    private String supplierAddress;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "po_status", nullable = false)
    private POStatus poStatus;
    
    @Column(name = "total_amount", precision = 19, scale = 2)
    private BigDecimal totalAmount;
    
    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;
    
    @Column(name = "expected_delivery_date")
    private LocalDate expectedDeliveryDate;
    
    @Column(name = "actual_delivery_date")
    private LocalDate actualDeliveryDate;
    
    @Column(name = "payment_terms")
    private String paymentTerms;
    
    @Column(name = "notes")
    private String notes;
    
    @Column(name = "created_by", nullable = false)
    private String createdBy;
    
    @Column(name = "is_approved")
    private Boolean isApproved = false;
    
    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<PurchaseOrderItem> purchaseOrderItems;
    
    @OneToOne(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private PurchaseOrderRequest purchaseOrderRequest;
    
    public enum POStatus {
        CREATED("PO Created"),
        SENT_TO_SUPPLIER("Sent to Supplier"),
        SUPPLIER_ACCEPTED("Supplier Accepted"),
        SUPPLIER_REJECTED("Supplier Rejected"),
        IN_PRODUCTION("In Production"),
        SHIPPED("Shipped"),
        DELIVERED("Delivered"),
        COMPLETED("Completed"),
        CANCELLED("Cancelled");
        
        private final String displayName;
        
        POStatus(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    // Constructors
    public PurchaseOrder() {}
    
    public PurchaseOrder(String poNumber, Project project, String supplierName, 
                        POStatus poStatus, String createdBy) {
        this.poNumber = poNumber;
        this.project = project;
        this.supplierName = supplierName;
        this.poStatus = poStatus;
        this.createdBy = createdBy;
        this.createdDate = LocalDateTime.now();
        this.totalAmount = BigDecimal.ZERO;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getPoNumber() {
        return poNumber;
    }
    
    public void setPoNumber(String poNumber) {
        this.poNumber = poNumber;
    }
    
    public Project getProject() {
        return project;
    }
    
    public void setProject(Project project) {
        this.project = project;
    }
    
    public String getSupplierName() {
        return supplierName;
    }
    
    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }
    
    public String getSupplierContact() {
        return supplierContact;
    }
    
    public void setSupplierContact(String supplierContact) {
        this.supplierContact = supplierContact;
    }
    
    public String getSupplierEmail() {
        return supplierEmail;
    }
    
    public void setSupplierEmail(String supplierEmail) {
        this.supplierEmail = supplierEmail;
    }
    
    public String getSupplierAddress() {
        return supplierAddress;
    }
    
    public void setSupplierAddress(String supplierAddress) {
        this.supplierAddress = supplierAddress;
    }
    
    public POStatus getPoStatus() {
        return poStatus;
    }
    
    public void setPoStatus(POStatus poStatus) {
        this.poStatus = poStatus;
    }
    
    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    public LocalDateTime getCreatedDate() {
        return createdDate;
    }
    
    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }
    
    public LocalDate getExpectedDeliveryDate() {
        return expectedDeliveryDate;
    }
    
    public void setExpectedDeliveryDate(LocalDate expectedDeliveryDate) {
        this.expectedDeliveryDate = expectedDeliveryDate;
    }
    
    public LocalDate getActualDeliveryDate() {
        return actualDeliveryDate;
    }
    
    public void setActualDeliveryDate(LocalDate actualDeliveryDate) {
        this.actualDeliveryDate = actualDeliveryDate;
    }
    
    public String getPaymentTerms() {
        return paymentTerms;
    }
    
    public void setPaymentTerms(String paymentTerms) {
        this.paymentTerms = paymentTerms;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public String getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
    
    public List<PurchaseOrderItem> getPurchaseOrderItems() {
        return purchaseOrderItems;
    }
    
    public void setPurchaseOrderItems(List<PurchaseOrderItem> purchaseOrderItems) {
        this.purchaseOrderItems = purchaseOrderItems;
    }
    
    public Boolean getIsApproved() {
        return isApproved;
    }
    
    public void setIsApproved(Boolean isApproved) {
        this.isApproved = isApproved;
    }
    
    public PurchaseOrderRequest getPurchaseOrderRequest() {
        return purchaseOrderRequest;
    }
    
    public void setPurchaseOrderRequest(PurchaseOrderRequest purchaseOrderRequest) {
        this.purchaseOrderRequest = purchaseOrderRequest;
    }
    
    @Transient
    @JsonProperty("projectId")
    public Long getProjectId() {
        return project != null ? project.getId() : null;
    }
    
    @Transient
    @JsonProperty("projectDescription")
    public String getProjectDescription() {
        return project != null ? project.getProjectDescription() : null;
    }
    
    @Transient
    @JsonProperty("projectType")
    public String getProjectType() {
        return project != null ? project.getProjectType() : null;
    }
}