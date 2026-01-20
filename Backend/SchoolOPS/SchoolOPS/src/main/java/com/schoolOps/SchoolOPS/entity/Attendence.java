package com.schoolOps.SchoolOPS.entity;


import java.time.LocalDate;
import java.util.List;

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
@ToString(exclude = {"teacher", "course", "students"})
@Slf4j
public class Attendence {

    // ---------- PRIMARY KEY ----------
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ---------- ATTENDANCE DETAILS ----------
    @Column(nullable = false)
    private LocalDate date;

    // ---------- RELATIONSHIPS ----------
    @ManyToOne(fetch = FetchType.LAZY)
    private Teacher teacher;

    @OneToOne(fetch = FetchType.LAZY)
    private Course course;

    @ManyToMany(fetch = FetchType.LAZY)
    private List<Student> students;

    // ---------- JPA CALLBACKS ----------
    @PrePersist
    protected void onCreate() {
        log.debug("Attendance created for date={}", date);
    }

    @PreUpdate
    protected void onUpdate() {
        log.debug("Attendance updated | id={}", id);
    }
}

