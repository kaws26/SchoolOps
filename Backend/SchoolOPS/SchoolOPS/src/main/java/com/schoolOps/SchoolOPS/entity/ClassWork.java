package com.schoolOps.SchoolOPS.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
@ToString(exclude = {"classRoom", "works"})
@Slf4j
public class ClassWork {

    // ---------- PRIMARY KEY ----------
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ---------- RELATIONSHIPS ----------
    @ManyToOne(fetch = FetchType.LAZY)
    private ClassRoom classRoom;

    // ---------- CLASSWORK DETAILS ----------
    @Column(nullable = false)
    private int totalMarks;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDate lastDate;

    @Column(length = 255)
    private String reference;

    @OneToMany(
            mappedBy = "classWork",
            fetch = FetchType.LAZY,
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<Work> works;

    // ---------- JPA CALLBACKS ----------
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        log.debug("ClassWork created | title={}", title);
    }

    @PreUpdate
    protected void onUpdate() {
        log.debug("ClassWork updated | id={}", id);
    }
}

