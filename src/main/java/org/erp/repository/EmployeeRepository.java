package org.erp.repository;

import org.erp.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    
    Optional<Employee> findByEmpId(String empId);
    
    Optional<Employee> findByPassportId(String passportId);
    
    Optional<Employee> findByEmiratesId(String emiratesId);
    
    boolean existsByEmpId(String empId);
    
    boolean existsByPassportId(String passportId);
    
    boolean existsByEmiratesId(String emiratesId);
}