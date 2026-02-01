package com.schoolOps.SchoolOPS.entity;


import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.extern.slf4j.Slf4j;

@Entity
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"user", "courses", "account"})
@Slf4j
public class Student {

    // ---------- PRIMARY KEY ----------
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ---------- BASIC DETAILS ----------
    @Column(nullable = false, unique = true)
    private int rollNo;

    @Column(nullable = false, unique = true)
    private int registrationNo;

    @Column(nullable = false, length = 100)
    private String name;

    private LocalDate dob;

    @Column(length = 10)
    private String sex;

    @Column(length = 100)
    private String fatherName;

    @Column(length = 150)
    private String email;

    @Column(length = 255)
    private String profileImageUrl;

    @Column(length = 255)
    private String profileImagePublicId;


    @Column(length = 50)
    private String addBy;

    @Column(length = 15)
    private Long numbers;

    // ---------- RELATIONSHIPS ----------
    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    private User user;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Address address;

    @JsonIgnore
    @ManyToMany(fetch = FetchType.LAZY)
    private List<Course> courses;

    @JsonIgnore
    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Account account;

    // ---------- JPA CALLBACKS ----------
    @PrePersist
    protected void onCreate() {
        log.debug("Student created | rollNo={}", rollNo);
    }

    @PreUpdate
    protected void onUpdate() {
        log.debug("Student updated | id={}", id);
    }
}

