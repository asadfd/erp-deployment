package org.erp.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_requests")
public class InventoryRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "request_type", nullable = false)
    private RequestType requestType;
    
    @Column(name = "inventory_id")
    private String inventoryId;
    
    @Column(name = "name")
    private String name;
    
    @Column(name = "production_date")
    private LocalDate productionDate;
    
    @Column(name = "expiry_date")
    private LocalDate expiryDate;
    
    @Column(name = "quantity")
    private Integer quantity;
    
    @Column(name = "per_quantity_price", precision = 10, scale = 2)
    private BigDecimal perQuantityPrice;
    
    @Column(name = "total_price", precision = 15, scale = 2)
    private BigDecimal totalPrice;
    
    @Column(name = "bill_number")
    private String billNumber;
    
    @Column(name = "supplier_name")
    private String supplierName;
    
    @Column(name = "requested_by", nullable = false)
    private String requestedBy;
    
    @Column(name = "request_date", nullable = false)
    private LocalDateTime requestDate;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RequestStatus status;
    
    @Column(name = "approved_by")
    private String approvedBy;
    
    @Column(name = "approval_date")
    private LocalDateTime approvalDate;
    
    @Column(name = "rejection_reason")
    private String rejectionReason;
    
    @Column(name = "target_inventory_id")
    private Long targetInventoryId;
    
    public enum RequestType {
        CREATE, UPDATE, DELETE
    }
    
    public enum RequestStatus {
        PENDING, APPROVED, REJECTED
    }
    
    public InventoryRequest() {}
    
    public InventoryRequest(RequestType requestType, String requestedBy) {
        this.requestType = requestType;
        this.requestedBy = requestedBy;
        this.requestDate = LocalDateTime.now();
        this.status = RequestStatus.PENDING;
    }
    
    @PrePersist
    @PreUpdate
    public void calculateTotalPrice() {
        if (quantity != null && perQuantityPrice != null) {
            this.totalPrice = perQuantityPrice.multiply(BigDecimal.valueOf(quantity));
        }
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public RequestType getRequestType() {
        return requestType;
    }
    
    public void setRequestType(RequestType requestType) {
        this.requestType = requestType;
    }
    
    public String getInventoryId() {
        return inventoryId;
    }
    
    public void setInventoryId(String inventoryId) {
        this.inventoryId = inventoryId;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public LocalDate getProductionDate() {
        return productionDate;
    }
    
    public void setProductionDate(LocalDate productionDate) {
        this.productionDate = productionDate;
    }
    
    public LocalDate getExpiryDate() {
        return expiryDate;
    }
    
    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }
    
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
        calculateTotalPrice();
    }
    
    public BigDecimal getPerQuantityPrice() {
        return perQuantityPrice;
    }
    
    public void setPerQuantityPrice(BigDecimal perQuantityPrice) {
        this.perQuantityPrice = perQuantityPrice;
        calculateTotalPrice();
    }
    
    public BigDecimal getTotalPrice() {
        return totalPrice;
    }
    
    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }
    
    public String getBillNumber() {
        return billNumber;
    }
    
    public void setBillNumber(String billNumber) {
        this.billNumber = billNumber;
    }
    
    public String getSupplierName() {
        return supplierName;
    }
    
    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }
    
    public String getRequestedBy() {
        return requestedBy;
    }
    
    public void setRequestedBy(String requestedBy) {
        this.requestedBy = requestedBy;
    }
    
    public LocalDateTime getRequestDate() {
        return requestDate;
    }
    
    public void setRequestDate(LocalDateTime requestDate) {
        this.requestDate = requestDate;
    }
    
    public RequestStatus getStatus() {
        return status;
    }
    
    public void setStatus(RequestStatus status) {
        this.status = status;
    }
    
    public String getApprovedBy() {
        return approvedBy;
    }
    
    public void setApprovedBy(String approvedBy) {
        this.approvedBy = approvedBy;
    }
    
    public LocalDateTime getApprovalDate() {
        return approvalDate;
    }
    
    public void setApprovalDate(LocalDateTime approvalDate) {
        this.approvalDate = approvalDate;
    }
    
    public String getRejectionReason() {
        return rejectionReason;
    }
    
    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
    
    public Long getTargetInventoryId() {
        return targetInventoryId;
    }
    
    public void setTargetInventoryId(Long targetInventoryId) {
        this.targetInventoryId = targetInventoryId;
    }
}