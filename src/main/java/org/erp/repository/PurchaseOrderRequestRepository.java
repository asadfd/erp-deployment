package org.erp.repository;

import org.erp.entity.PurchaseOrderRequest;
import org.erp.entity.PurchaseOrderRequest.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderRequestRepository extends JpaRepository<PurchaseOrderRequest, Long> {
    
    List<PurchaseOrderRequest> findByRequestStatus(RequestStatus status);
    
    Optional<PurchaseOrderRequest> findByPurchaseOrderId(Long purchaseOrderId);
    
    @Query("SELECT por FROM PurchaseOrderRequest por WHERE por.requestStatus = :status ORDER BY por.requestDate DESC")
    List<PurchaseOrderRequest> findPendingRequests(@Param("status") RequestStatus status);
    
    @Query("SELECT COUNT(por) FROM PurchaseOrderRequest por WHERE por.requestStatus = 'PENDING'")
    long countPendingRequests();
}