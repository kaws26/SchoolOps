package com.schoolOps.SchoolOPS.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassWorkResponseDto {
    private Long id;
    private String classRoomId;
    private int totalMarks;
    private String title;
    private String description;
    private LocalDateTime createdAt;
    private LocalDate lastDate;
    private String reference;
    private List<String> workIds;

    public static ClassWorkResponseDto fromEntity(com.schoolOps.SchoolOPS.entity.ClassWork classWork) {
        if (classWork == null) return null;
        return new ClassWorkResponseDto(
            classWork.getId(),
            classWork.getClassRoom() != null ? classWork.getClassRoom().getId().toString() : null,
            classWork.getTotalMarks(),
            classWork.getTitle(),
            classWork.getDescription(),
            classWork.getCreatedAt(),
            classWork.getLastDate(),
            classWork.getReference(),
            classWork.getWorks() != null ? classWork.getWorks().stream().map(w -> w.getId().toString()).collect(Collectors.toList()) : List.of()
        );
    }
}