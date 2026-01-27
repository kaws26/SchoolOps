package com.schoolOps.SchoolOPS.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnqueryResponseDto {
    private Long id;
    private String email;
    private Long mobile;
    private String subject;
    private String status;
    private String name;
    private String message;

    public static EnqueryResponseDto fromEntity(com.schoolOps.SchoolOPS.entity.Enquery enquery) {
        if (enquery == null) return null;
        return new EnqueryResponseDto(
            enquery.getId(),
            enquery.getEmail(),
            enquery.getMobile(),
            enquery.getSubject(),
            enquery.getStatus(),
            enquery.getName(),
            enquery.getMessage()
        );
    }
}