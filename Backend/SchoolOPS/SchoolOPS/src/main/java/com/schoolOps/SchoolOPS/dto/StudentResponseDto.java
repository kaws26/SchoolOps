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
public class StudentResponseDto {
    private Long id;
    private int rollNo;
    private int registrationNo;
    private String name;
    private LocalDate dob;
    private String sex;
    private String fatherName;
    private String email;
    private String profile;
    private String addBy;
    private Long numbers;
    private AddressDto address;
    private List<String> courseNames;

    public static StudentResponseDto fromEntity(com.schoolOps.SchoolOPS.entity.Student student) {
        if (student == null) return null;
        return new StudentResponseDto(
            student.getId(),
            student.getRollNo(),
            student.getRegistrationNo(),
            student.getName(),
            student.getDob(),
            student.getSex(),
            student.getFatherName(),
            student.getEmail(),
            student.getProfile(),
            student.getAddBy(),
            student.getNumbers(),
            AddressDto.fromEntity(student.getAddress()),
            student.getCourses() != null ? student.getCourses().stream().map(c -> c.getName()).collect(Collectors.toList()) : List.of()
        );
    }
}