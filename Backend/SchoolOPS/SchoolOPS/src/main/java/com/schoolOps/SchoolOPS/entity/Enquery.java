package com.schoolOps.SchoolOPS.entity;


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
@ToString(exclude = {"message"})
@Slf4j
public class Enquery {

    // ---------- PRIMARY KEY ----------
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ---------- ENQUERY DETAILS ----------
    @Column(nullable = false, length = 100)
    private String email;

    @Column(length = 15)
    private Long mobile;

    @Column(nullable = false, length = 150)
    private String subject;

    @Column(nullable = false, length = 50)
    private String status;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 2000)
    private String message;

    // ---------- JPA CALLBACKS ----------
    @PrePersist
    protected void onCreate() {
        log.debug("Enquery created | email={}", email);
    }

    @PreUpdate
    protected void onUpdate() {
        log.debug("Enquery updated | id={}", id);
    }
}

