package com.schoolOps.SchoolOPS.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherRequestDto {
    private LocalDate date;
    private String name;
    private String fatherName;
    private String email;
    private String profile;
    private Long numbers;
    private int salary;
    private String username;
    private String password;
    private String role;
    private AddressDto address;
    private List<Long> courseIds;

    public com.schoolOps.SchoolOPS.entity.Teacher toEntity() {
        com.schoolOps.SchoolOPS.entity.Teacher teacher = new com.schoolOps.SchoolOPS.entity.Teacher();
        teacher.setDate(this.date);
        teacher.setName(this.name);
        teacher.setFatherName(this.fatherName);
        teacher.setEmail(this.email);
        teacher.setProfile(this.profile);
        teacher.setNumbers(this.numbers);
        teacher.setSalary(this.salary);
        // User and courses need to be set in service
        return teacher;
    }
}