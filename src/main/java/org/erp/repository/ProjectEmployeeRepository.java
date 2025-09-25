package org.erp.repository;

import org.erp.entity.ProjectEmployee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectEmployeeRepository extends JpaRepository<ProjectEmployee, Long> {
    
    List<ProjectEmployee> findByProjectId(Long projectId);
    
    List<ProjectEmployee> findByEmployeeId(Long employeeId);
    
    @Query("SELECT pe FROM ProjectEmployee pe WHERE pe.project.id = :projectId AND pe.employee.id = :employeeId")
    ProjectEmployee findByProjectIdAndEmployeeId(@Param("projectId") Long projectId, @Param("employeeId") Long employeeId);
    
    @Query("SELECT pe FROM ProjectEmployee pe WHERE pe.project.id = :projectId")
    List<ProjectEmployee> findEmployeesByProjectId(@Param("projectId") Long projectId);
}