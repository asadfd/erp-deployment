package org.erp.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "mrf_items")
public class MRFItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "item_description", nullable = false)
    private String itemDescription;
    
    @Column(name = "quantity", nullable = false)
    private Integer quantity;
    
    @Column(name = "specifications")
    private String specifications;
    
    @Column(name = "unit_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal unitPrice;
    
    @Column(name = "amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal amount;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mrf_id")
    private MaterialRequestForm materialRequestForm;
    
    public MRFItem() {}
    
    public MRFItem(String itemDescription, Integer quantity, String specifications, BigDecimal unitPrice) {
        this.itemDescription = itemDescription;
        this.quantity = quantity;
        this.specifications = specifications;
        this.unitPrice = unitPrice;
        calculateAmount();
    }
    
    @PrePersist
    @PreUpdate
    public void calculateAmount() {
        if (quantity != null && unitPrice != null) {
            this.amount = unitPrice.multiply(BigDecimal.valueOf(quantity));
        }
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getItemDescription() {
        return itemDescription;
    }
    
    public void setItemDescription(String itemDescription) {
        this.itemDescription = itemDescription;
    }
    
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
        calculateAmount();
    }
    
    public String getSpecifications() {
        return specifications;
    }
    
    public void setSpecifications(String specifications) {
        this.specifications = specifications;
    }
    
    public BigDecimal getUnitPrice() {
        return unitPrice;
    }
    
    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
        calculateAmount();
    }
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public MaterialRequestForm getMaterialRequestForm() {
        return materialRequestForm;
    }
    
    public void setMaterialRequestForm(MaterialRequestForm materialRequestForm) {
        this.materialRequestForm = materialRequestForm;
    }
}