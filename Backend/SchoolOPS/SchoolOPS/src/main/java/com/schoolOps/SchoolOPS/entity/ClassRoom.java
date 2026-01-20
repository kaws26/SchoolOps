package com.schoolOps.SchoolOPS.entity;


import java.util.List;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(name = "CLASSROOM")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"course", "classwork"})
@Slf4j
public class ClassRoom {

    // ---------- PRIMARY KEY ----------
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ---------- RELATIONSHIPS ----------
    @OneToOne(fetch = FetchType.LAZY)
    private Course course;

    @OneToMany(
            mappedBy = "classRoom",
            fetch = FetchType.LAZY,
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<ClassWork> classwork;

    // ---------- JPA CALLBACKS ----------
    @PrePersist
    protected void onCreate() {
        log.debug("ClassRoom created");
    }

    @PreUpdate
    protected void onUpdate() {
        log.debug("ClassRoom updated | id={}", id);
    }
}

