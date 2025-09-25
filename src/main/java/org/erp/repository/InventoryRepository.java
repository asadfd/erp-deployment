package org.erp.repository;

import org.erp.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    
    Optional<Inventory> findByInventoryId(String inventoryId);
    
    boolean existsByInventoryId(String inventoryId);
    
    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(i.inventoryId, 4) AS int)), 0) FROM Inventory i WHERE i.inventoryId LIKE 'INV%'")
    Integer findMaxInventoryNumber();
    
    void deleteByInventoryId(String inventoryId);
}