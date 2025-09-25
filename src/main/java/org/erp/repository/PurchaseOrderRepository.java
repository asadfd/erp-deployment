package org.erp.repository;

import org.erp.entity.Project;
import org.erp.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    
    List<PurchaseOrder> findByProject_Id(Long projectId);
    
    List<PurchaseOrder> findByCreatedBy(String createdBy);
    
    Optional<PurchaseOrder> findByPoNumber(String poNumber);
    
    @Query("SELECT po FROM PurchaseOrder po WHERE po.project.id IN :projectIds ORDER BY po.createdDate DESC")
    List<PurchaseOrder> findByProjectIds(@Param("projectIds") List<Long> projectIds);
    
    @Query("SELECT COUNT(po) FROM PurchaseOrder po WHERE po.project.id = :projectId")
    Long countByProjectId(@Param("projectId") Long projectId);
    
    @Query("SELECT po FROM PurchaseOrder po WHERE po.poStatus = :status")
    List<PurchaseOrder> findByPoStatus(@Param("status") PurchaseOrder.POStatus status);
    
    List<PurchaseOrder> findByProjectAndCreatedDateBetween(Project project, LocalDateTime startDate, LocalDateTime endDate);
}