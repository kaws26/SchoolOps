package com.schoolOps.SchoolOPS.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseResponseDto {
    private Long id;
    private String name;
    private String session;
    private String duration;
    private String profile;
    private String about;
    private String fees;
    private String time;
    private Long classRoomId;
    private String teacherName;
    private List<String> studentNames;

    public static CourseResponseDto fromEntity(com.schoolOps.SchoolOPS.entity.Course course) {
        if (course == null) return null;
        return new CourseResponseDto(
            course.getId(),
            course.getName(),
            course.getSession(),
            course.getDuration(),
            course.getProfile(),
            course.getAbout(),
            course.getFees(),
            course.getTime(),
            course.getClassRoom() != null ? course.getClassRoom().getId() : null,
            course.getTeacher() != null ? course.getTeacher().getName() : null,
            course.getStudents() != null ? course.getStudents().stream().map(s -> s.getName()).collect(Collectors.toList()) : List.of()
        );
    }
}