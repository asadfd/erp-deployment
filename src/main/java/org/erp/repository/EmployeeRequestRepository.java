package org.erp.repository;

import org.erp.entity.EmployeeRequest;
import org.erp.entity.EmployeeRequest.RequestStatus;
import org.erp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRequestRepository extends JpaRepository<EmployeeRequest, Long> {

    List<EmployeeRequest> findByStatus(RequestStatus status);

    List<EmployeeRequest> findByRequestedBy(User requestedBy);

    List<EmployeeRequest> findByRequestedByAndStatus(User requestedBy, RequestStatus status);

    Optional<EmployeeRequest> findByEmpIdAndStatus(String empId, RequestStatus status);

    boolean existsByEmpIdAndStatusIn(String empId, List<RequestStatus> statuses);

    boolean existsByPassportIdAndStatusIn(String passportId, List<RequestStatus> statuses);

    boolean existsByEmiratesIdAndStatusIn(String emiratesId, List<RequestStatus> statuses);
}