package org.erp.repository;

import org.erp.entity.PurchaseOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseOrderItemRepository extends JpaRepository<PurchaseOrderItem, Long> {
    
    List<PurchaseOrderItem> findByPurchaseOrderId(Long purchaseOrderId);
    
    List<PurchaseOrderItem> findByInventoryId(Long inventoryId);
    
    @Query("SELECT poi FROM PurchaseOrderItem poi WHERE poi.purchaseOrder.project.id = :projectId")
    List<PurchaseOrderItem> findByProjectId(@Param("projectId") Long projectId);
    
    @Query("SELECT SUM(poi.totalPrice) FROM PurchaseOrderItem poi WHERE poi.purchaseOrder.id = :purchaseOrderId")
    Double getTotalAmountByPurchaseOrderId(@Param("purchaseOrderId") Long purchaseOrderId);
}