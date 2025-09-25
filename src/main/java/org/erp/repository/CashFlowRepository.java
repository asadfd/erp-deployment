package org.erp.repository;

import org.erp.entity.CashFlow;
import org.erp.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CashFlowRepository extends JpaRepository<CashFlow, Long> {
    
    List<CashFlow> findByProjectAndTransactionDateBetween(Project project, LocalDate startDate, LocalDate endDate);
    
    List<CashFlow> findByTransactionDateBetween(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT cf FROM CashFlow cf WHERE cf.project.id = :projectId AND cf.transactionDate BETWEEN :startDate AND :endDate")
    List<CashFlow> findByProjectIdAndDateRange(@Param("projectId") Long projectId, 
                                               @Param("startDate") LocalDate startDate, 
                                               @Param("endDate") LocalDate endDate);
    
    @Query("SELECT cf.project.id, cf.type, SUM(cf.amount) FROM CashFlow cf " +
           "WHERE cf.transactionDate BETWEEN :startDate AND :endDate " +
           "GROUP BY cf.project.id, cf.type")
    List<Object[]> getProjectCashFlowSummary(@Param("startDate") LocalDate startDate, 
                                             @Param("endDate") LocalDate endDate);
}