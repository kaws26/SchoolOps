package com.schoolOps.SchoolOPS.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NoticeResponseDto {
    private Long id;
    private String title;
    private LocalDateTime date;
    private String issueby;
    private String image;
    private String description;

    public static NoticeResponseDto fromEntity(com.schoolOps.SchoolOPS.entity.Notice notice) {
        if (notice == null) return null;
        return new NoticeResponseDto(
            notice.getId(),
            notice.getTitle(),
            notice.getDate(),
            notice.getIssueby(),
            notice.getImage(),
            notice.getDescription()
        );
    }
}