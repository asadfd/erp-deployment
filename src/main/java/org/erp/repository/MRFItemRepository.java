package org.erp.repository;

import org.erp.entity.MRFItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MRFItemRepository extends JpaRepository<MRFItem, Long> {
    
    List<MRFItem> findByMaterialRequestFormId(Long mrfId);
}