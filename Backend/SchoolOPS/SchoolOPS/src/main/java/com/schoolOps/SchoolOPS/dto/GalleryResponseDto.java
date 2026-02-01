package com.schoolOps.SchoolOPS.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GalleryResponseDto {
    private Long id;
    private String pic;
    private String about;
    private LocalDate date;

    public static GalleryResponseDto fromEntity(com.schoolOps.SchoolOPS.entity.Gallery gallery) {
        if (gallery == null) return null;
        return new GalleryResponseDto(
            gallery.getId(),
            gallery.getImageUrl(),
            gallery.getAbout(),
            gallery.getDate()
        );
    }
}