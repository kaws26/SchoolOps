package com.schoolOps.SchoolOPS.entity;


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
@ToString(exclude = {"classRoom", "teacher", "attendence", "students"})
@Slf4j
public class Course {

    // ---------- PRIMARY KEY ----------
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ---------- COURSE DETAILS ----------
    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 50)
    private String session;

    @Column(length = 50)
    private String duration;

    @Column(length = 255)
    private String profile;

    @Column(length = 2000)
    private String about;

    @Column(length = 50)
    private String fees;

    @Column(length = 50)
    private String time;

    // ---------- RELATIONSHIPS ----------
    @OneToOne(mappedBy = "course", fetch = FetchType.LAZY)
    private ClassRoom classRoom;

    @OneToOne(fetch = FetchType.LAZY)
    private Teacher teacher;

    @OneToMany(mappedBy = "course", fetch = FetchType.LAZY)
    private List<Attendence> attendence;

    @ManyToMany(mappedBy = "courses", fetch = FetchType.LAZY)
    private List<Student> students;

    // ---------- JPA CALLBACKS ----------
    @PrePersist
    protected void onCreate() {
        log.debug("Course created | name={}", name);
    }

    @PreUpdate
    protected void onUpdate() {
        log.debug("Course updated | id={}", id);
    }
}

