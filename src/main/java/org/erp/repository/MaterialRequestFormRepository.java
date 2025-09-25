package org.erp.repository;

import org.erp.entity.MaterialRequestForm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaterialRequestFormRepository extends JpaRepository<MaterialRequestForm, Long> {
    
    List<MaterialRequestForm> findByStatus(MaterialRequestForm.MRFStatus status);
    
    List<MaterialRequestForm> findByRequestedByOrderByCreationDateDesc(String requestedBy);
    
    Optional<MaterialRequestForm> findByMrfNumber(String mrfNumber);
    
    List<MaterialRequestForm> findByStatusAndRequiresSuperadmin(MaterialRequestForm.MRFStatus status, Boolean requiresSuperadmin);
    
    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(m.mrfNumber, 4) AS int)), 0) FROM MaterialRequestForm m WHERE m.mrfNumber LIKE 'MRF%'")
    Integer findMaxMrfNumber();
}