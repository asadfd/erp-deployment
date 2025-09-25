package org.erp.repository;

import org.erp.entity.InventoryRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryRequestRepository extends JpaRepository<InventoryRequest, Long> {
    
    List<InventoryRequest> findByStatus(InventoryRequest.RequestStatus status);
    
    List<InventoryRequest> findByRequestedBy(String requestedBy);
    
    List<InventoryRequest> findByRequestedByOrderByRequestDateDesc(String requestedBy);
}