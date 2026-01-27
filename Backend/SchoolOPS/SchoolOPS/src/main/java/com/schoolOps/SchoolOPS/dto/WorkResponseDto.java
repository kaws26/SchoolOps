package com.schoolOps.SchoolOPS.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkResponseDto {
    private Long id;
    private String classWorkTitle;
    private String studentName;
    private float marks;
    private String work;

    public static WorkResponseDto fromEntity(com.schoolOps.SchoolOPS.entity.Work work) {
        if (work == null) return null;
        return new WorkResponseDto(
            work.getId(),
            work.getClassWork() != null ? work.getClassWork().getTitle() : null,
            work.getStudent() != null ? work.getStudent().getName() : null,
            work.getMarks(),
            work.getWork()
        );
    }
}