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
public class TeacherResponseDto {
    private Long id;
    private LocalDate date;
    private String name;
    private String fatherName;
    private String email;
    private String profile;
    private Long numbers;
    private int salary;
    private String userName;
    private AddressDto address;
    private String accountId;
    private List<String> courseNames;

    public static TeacherResponseDto fromEntity(com.schoolOps.SchoolOPS.entity.Teacher teacher) {
        if (teacher == null) return null;
        return new TeacherResponseDto(
            teacher.getId(),
            teacher.getDate(),
            teacher.getName(),
            teacher.getFatherName(),
            teacher.getEmail(),
            teacher.getProfile(),
            teacher.getNumbers(),
            teacher.getSalary(),
            teacher.getUser() != null ? teacher.getUser().getName() : null,
            AddressDto.fromEntity(teacher.getAddress()),
            teacher.getAccount() != null ? teacher.getAccount().getId().toString() : null,
            teacher.getCourses() != null ? teacher.getCourses().stream().map(c -> c.getName()).collect(Collectors.toList()) : List.of()
        );
    }
}