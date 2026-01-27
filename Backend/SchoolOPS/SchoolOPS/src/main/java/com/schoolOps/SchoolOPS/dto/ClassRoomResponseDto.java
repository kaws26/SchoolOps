package com.schoolOps.SchoolOPS.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassRoomResponseDto {
    private Long id;
    private String courseName;
    private List<String> classWorkTitles;

    public static ClassRoomResponseDto fromEntity(com.schoolOps.SchoolOPS.entity.ClassRoom classRoom) {
        if (classRoom == null) return null;
        return new ClassRoomResponseDto(
            classRoom.getId(),
            classRoom.getCourse() != null ? classRoom.getCourse().getName() : null,
            classRoom.getClasswork() != null ? classRoom.getClasswork().stream().map(cw -> cw.getTitle()).collect(Collectors.toList()) : List.of()
        );
    }
}