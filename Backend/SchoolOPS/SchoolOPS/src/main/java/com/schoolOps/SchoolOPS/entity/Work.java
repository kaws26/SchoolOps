package com.schoolOps.SchoolOPS.entity;


import jakarta.persistence.*;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(name = "work")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"classWork", "student"})
@Slf4j
public class Work {

    // ---------- PRIMARY KEY ----------
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ---------- RELATIONSHIPS ----------
    @OneToOne(fetch = FetchType.LAZY)
    private ClassWork classWork;

    @OneToOne(fetch = FetchType.LAZY)
    private Student student;

    // ---------- WORK DETAILS ----------
    @Column(nullable = false)
    private float marks;

    @Column(columnDefinition = "TEXT")
    private String work;

    // ---------- JPA CALLBACKS ----------
    @PrePersist
    protected void onCreate() {
        log.debug("Work submitted | marks={}", marks);
    }

    @PreUpdate
    protected void onUpdate() {
        log.debug("Work updated | id={}", id);
    }
}

