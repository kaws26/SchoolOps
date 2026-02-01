package com.schoolOps.SchoolOPS.entity;


import java.time.LocalDate;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(name = "gallery")
@Getter
@Setter
@NoArgsConstructor
@ToString
@Slf4j
public class Gallery {

    // ---------- PRIMARY KEY ----------
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ---------- GALLERY DETAILS ----------
    @Column(nullable = false, length = 255)
    private String imageUrl;

    @Column(nullable = false, length = 255)
    private String imagePublicId;

    @Column(length = 70)
    private String about;

    @Column(nullable = false)
    private LocalDate date;

    // ---------- JPA CALLBACKS ----------
    @PrePersist
    protected void onCreate() {
        log.debug("Gallery entry created");
    }

    @PreUpdate
    protected void onUpdate() {
        log.debug("Gallery entry updated | id={}", id);
    }
}

