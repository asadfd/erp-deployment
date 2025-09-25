package org.erp.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "project_inventory_items")
public class ProjectInventoryItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonBackReference("project-inventory-items")
    private Project project;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_id", nullable = false)
    private Inventory inventory;
    
    @Column(nullable = false)
    private Integer requiredQuantity;
    
    @Column(nullable = false)
    private Integer allocatedQuantity;
    
    @Column(nullable = false)
    private Integer shortageQuantity;
    
    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal unitPrice;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal totalPrice;
    
    @Column
    private Boolean poCreated = false;
    
    public ProjectInventoryItem() {}
    
    public ProjectInventoryItem(Project project, Inventory inventory, Integer requiredQuantity, 
                               Integer allocatedQuantity, Integer shortageQuantity, 
                               BigDecimal unitPrice, BigDecimal totalPrice) {
        this.project = project;
        this.inventory = inventory;
        this.requiredQuantity = requiredQuantity;
        this.allocatedQuantity = allocatedQuantity;
        this.shortageQuantity = shortageQuantity;
        this.unitPrice = unitPrice;
        this.totalPrice = totalPrice;
        this.poCreated = false;
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
    
    public Inventory getInventory() {
        return inventory;
    }
    
    public void setInventory(Inventory inventory) {
        this.inventory = inventory;
    }
    
    public Integer getRequiredQuantity() {
        return requiredQuantity;
    }
    
    public void setRequiredQuantity(Integer requiredQuantity) {
        this.requiredQuantity = requiredQuantity;
    }
    
    public Integer getAllocatedQuantity() {
        return allocatedQuantity;
    }
    
    public void setAllocatedQuantity(Integer allocatedQuantity) {
        this.allocatedQuantity = allocatedQuantity;
    }
    
    public Integer getShortageQuantity() {
        return shortageQuantity;
    }
    
    public void setShortageQuantity(Integer shortageQuantity) {
        this.shortageQuantity = shortageQuantity;
    }
    
    public BigDecimal getUnitPrice() {
        return unitPrice;
    }
    
    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }
    
    public BigDecimal getTotalPrice() {
        return totalPrice;
    }
    
    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }
    
    public Boolean getPoCreated() {
        return poCreated;
    }
    
    public void setPoCreated(Boolean poCreated) {
        this.poCreated = poCreated;
    }
}