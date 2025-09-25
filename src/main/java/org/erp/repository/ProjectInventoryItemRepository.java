package org.erp.repository;

import org.erp.entity.Project;
import org.erp.entity.ProjectInventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectInventoryItemRepository extends JpaRepository<ProjectInventoryItem, Long> {
    
    List<ProjectInventoryItem> findByProjectId(Long projectId);
    
    List<ProjectInventoryItem> findByInventoryId(Long inventoryId);
    
    @Query("SELECT pii FROM ProjectInventoryItem pii WHERE pii.project.id = :projectId")
    List<ProjectInventoryItem> findProjectInventoryItemsByProjectId(@Param("projectId") Long projectId);
    
    @Query("SELECT SUM(pii.totalPrice) FROM ProjectInventoryItem pii WHERE pii.project.id = :projectId")
    Double getTotalInventoryExpenseByProjectId(@Param("projectId") Long projectId);
    
    List<ProjectInventoryItem> findByProject(Project project);
}