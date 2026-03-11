package com.mountain.for_mountain.domain.employee.repository;

import com.mountain.for_mountain.domain.employee.model.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmployeeNumber(String employeeNumber);

    List<Employee> findAllByOrderByJoinDateDesc();
}
