package org.erp.repository;

import org.erp.entity.Project;
import org.erp.entity.Timesheet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TimesheetRepository extends JpaRepository<Timesheet, Long> {
    
    List<Timesheet> findByProjectId(Long projectId);
    
    List<Timesheet> findByEmployeeId(Long employeeId);
    
    List<Timesheet> findByWorkDate(LocalDate workDate);
    
    @Query("SELECT t FROM Timesheet t WHERE t.project.id = :projectId AND t.employee.id = :employeeId")
    List<Timesheet> findByProjectIdAndEmployeeId(@Param("projectId") Long projectId, @Param("employeeId") Long employeeId);
    
    @Query("SELECT t FROM Timesheet t WHERE t.project.id = :projectId AND t.workDate BETWEEN :startDate AND :endDate")
    List<Timesheet> findByProjectIdAndDateRange(@Param("projectId") Long projectId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT t FROM Timesheet t WHERE t.project.id = :projectId AND t.employee.id = :employeeId AND t.workDate = :workDate")
    Timesheet findByProjectEmployeeAndDate(@Param("projectId") Long projectId, @Param("employeeId") Long employeeId, @Param("workDate") LocalDate workDate);
    
    @Query("SELECT SUM(t.hoursWorked) FROM Timesheet t WHERE t.project.id = :projectId AND t.workDate = :workDate")
    Double getTotalHoursByProjectAndDate(@Param("projectId") Long projectId, @Param("workDate") LocalDate workDate);
    
    @Query("SELECT COUNT(DISTINCT t.employee.id) FROM Timesheet t WHERE t.project.id = :projectId AND t.workDate = :workDate")
    Long getEmployeeCountByProjectAndDate(@Param("projectId") Long projectId, @Param("workDate") LocalDate workDate);
    
    List<Timesheet> findByWorkDateBetween(LocalDate startDate, LocalDate endDate);
    
    List<Timesheet> findByProjectAndWorkDateBetween(Project project, LocalDate startDate, LocalDate endDate);
}