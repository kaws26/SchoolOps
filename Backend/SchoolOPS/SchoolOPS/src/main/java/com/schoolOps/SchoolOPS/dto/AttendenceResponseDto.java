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
public class AttendenceResponseDto {
    private Long id;
    private LocalDate date;
    private String teacherName;
    private String courseName;
    private List<String> studentNames;

    public static AttendenceResponseDto fromEntity(com.schoolOps.SchoolOPS.entity.Attendence attendence) {
        if (attendence == null) return null;
        return new AttendenceResponseDto(
            attendence.getId(),
            attendence.getDate(),
            attendence.getTeacher() != null ? attendence.getTeacher().getName() : null,
            attendence.getCourse() != null ? attendence.getCourse().getName() : null,
            attendence.getStudents() != null ? attendence.getStudents().stream().map(s -> s.getName()).collect(Collectors.toList()) : List.of()
        );
    }
}