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
@ToString(exclude = {"user", "address", "courses", "account"})
@Slf4j
public class Teacher {

    // ---------- PRIMARY KEY ----------
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ---------- BASIC DETAILS ----------
    private LocalDate date;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 100)
    private String fatherName;

    @Column(length = 150)
    private String email;

    @Column(length = 255)
    private String profileImageUrl;

    @Column(length = 255)
    private String profileImagePublicId;

    @Column(length = 15)
    private Long numbers;

    @Column(nullable = false)
    private int salary;

    // ---------- RELATIONSHIPS ----------
    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    private User user;

    @OneToOne(
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY,
            orphanRemoval = true
    )
    @JoinColumn(name = "address_id")
    private Address address;

    @OneToMany(mappedBy = "teacher", fetch = FetchType.LAZY)
    private List<Course> courses;

    @JsonIgnore
    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Account account;

    // ---------- JPA CALLBACKS ----------
    @PrePersist
    protected void onCreate() {
        log.debug("Teacher created | name={}", name);
    }

    @PreUpdate
    protected void onUpdate() {
        log.debug("Teacher updated | id={}", id);
    }
}

