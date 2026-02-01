package com.schoolOps.SchoolOPS.entity;


import java.time.LocalDateTime;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.extern.slf4j.Slf4j;

@Entity
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"description"})
@Slf4j
public class Notice {

    // ---------- PRIMARY KEY ----------
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ---------- NOTICE DETAILS ----------
    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false)
    private LocalDateTime date;

    @Column(nullable = false, length = 100)
    private String issueby;

    @Column(length = 255)
    private String imageUrl;

    @Column(length = 255)
    private String imagePublicId;


    @Lob
    private String description;

    // ---------- JPA CALLBACKS ----------
    @PrePersist
    protected void onCreate() {
        date = LocalDateTime.now();
        log.debug("Notice created | title={}", title);
    }

    @PreUpdate
    protected void onUpdate() {
        log.debug("Notice updated | id={}", id);
    }
}

