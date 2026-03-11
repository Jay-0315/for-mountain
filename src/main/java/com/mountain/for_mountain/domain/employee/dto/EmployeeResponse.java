package com.mountain.for_mountain.domain.employee.dto;

import com.mountain.for_mountain.domain.employee.model.entity.Employee;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

@Getter
@Schema(description = "Employee response")
public class EmployeeResponse {

    private final Long id;
    private final String employeeNumber;
    private final String name;
    private final String nameKana;
    private final String nationality;
    private final String birthDate;
    private final String department;
    private final String position;
    private final String jobTitle;
    private final String joinDate;
    private final String email;
    private final String status;

    public EmployeeResponse(Employee employee) {
        this.id = employee.getId();
        this.employeeNumber = employee.getEmployeeNumber();
        this.name = employee.getName();
        this.nameKana = employee.getNameKana();
        this.nationality = employee.getNationality();
        this.birthDate = employee.getBirthDate().toString();
        this.department = employee.getDepartment();
        this.position = employee.getPosition();
        this.jobTitle = employee.getJobTitle();
        this.joinDate = employee.getJoinDate().toString();
        this.email = employee.getEmail();
        this.status = employee.getStatus();
    }
}
