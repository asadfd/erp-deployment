package org.erp.repository;

import org.erp.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    
    List<Project> findByProjectType(String projectType);
    
    @Query("SELECT p FROM Project p WHERE p.startDate >= :startDate")
    List<Project> findProjectsStartingFrom(@Param("startDate") LocalDate startDate);
    
    @Query("SELECT p FROM Project p WHERE p.endDate <= :endDate")
    List<Project> findProjectsEndingBy(@Param("endDate") LocalDate endDate);
    
    @Query("SELECT p FROM Project p WHERE p.startDate <= :currentDate AND p.endDate >= :currentDate")
    List<Project> findActiveProjects(@Param("currentDate") LocalDate currentDate);
    
    @Query("SELECT p FROM Project p WHERE p.endDate < :currentDate")
    List<Project> findCompletedProjects(@Param("currentDate") LocalDate currentDate);
    
    @Query("SELECT p FROM Project p WHERE p.startDate > :currentDate")
    List<Project> findUpcomingProjects(@Param("currentDate") LocalDate currentDate);
}