package org.erp.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "inventory")
public class Inventory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "inventory_id", nullable = false, unique = true)
    private String inventoryId;
    
    @Column(nullable = false)
    private String name;
    
    @Column(name = "production_date", nullable = false)
    private LocalDate productionDate;
    
    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;
    
    @Column(nullable = false)
    private Integer quantity;
    
    @Column(name = "per_quantity_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal perQuantityPrice;
    
    @Column(name = "total_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalPrice;
    
    @Column(name = "bill_number", nullable = false)
    private String billNumber;
    
    @Column(name = "supplier_name", nullable = false)
    private String supplierName;
    
    @Column(name = "created_date", nullable = false)
    private LocalDate createdDate;
    
    public Inventory() {}
    
    public Inventory(String inventoryId, String name, LocalDate productionDate, LocalDate expiryDate,
                    Integer quantity, BigDecimal perQuantityPrice, String billNumber, String supplierName) {
        this.inventoryId = inventoryId;
        this.name = name;
        this.productionDate = productionDate;
        this.expiryDate = expiryDate;
        this.quantity = quantity;
        this.perQuantityPrice = perQuantityPrice;
        this.totalPrice = perQuantityPrice.multiply(BigDecimal.valueOf(quantity));
        this.billNumber = billNumber;
        this.supplierName = supplierName;
        this.createdDate = LocalDate.now();
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
    
    public LocalDate getCreatedDate() {
        return createdDate;
    }
    
    public void setCreatedDate(LocalDate createdDate) {
        this.createdDate = createdDate;
    }
}