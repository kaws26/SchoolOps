package com.schoolOps.SchoolOPS.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDto {
    private Long id;
    private String username;
    private boolean enabled;
    private String role;
    private String name;
    private String sex;
    private Long mobile;
    private Date dob;
    private String profile;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String studentName;
    private String teacherName;

    public static UserResponseDto fromEntity(com.schoolOps.SchoolOPS.entity.User user) {
        if (user == null) return null;
        return new UserResponseDto(
            user.getId(),
            user.getUsername(),
            user.isEnabled(),
            user.getRole(),
            user.getName(),
            user.getSex(),
            user.getMobile(),
            user.getDob(),
            user.getProfile(),
            user.getCreatedAt(),
            user.getUpdatedAt(),
            user.getStudent() != null ? user.getStudent().getName() : null,
            user.getTeacher() != null ? user.getTeacher().getName() : null
        );
    }
}