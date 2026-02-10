package com.schoolOps.SchoolOPS.entity;


import java.time.LocalDateTime;
import java.util.Date;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_users_username", columnNames = "username")
        }
)
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"password", "student", "teacher"})
@Slf4j
public class User {

    // ---------- PRIMARY KEY ----------
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ---------- AUTH ----------
    @NotBlank
    @Size(min = 4, max = 50)
    @Column(nullable = false, length = 50)
    private String username;

    @NotBlank
    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private boolean enabled = true;

    @NotBlank
    @Column(nullable = false, length = 20)
    private String role;

    //  FIRST LOGIN / RESET PASSWORD
    @Column(nullable = false)
    private boolean firstLogin = true;

    @Column(length = 100)
    private String resetToken;

    private LocalDateTime resetTokenExpiry;

    // ---------- PROFILE ----------
    @NotBlank
    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 10)
    private String sex;

    @Column(length = 15)
    private Long mobile;

    private Date dob;

    @Column(length = 255)
    private String profileImageUrl;

    @Column(length = 255)
    private String profileImagePublicId;

    // ---------- RELATIONSHIPS ----------
    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY)
    private Student student;

    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY)
    private Teacher teacher;

    // ---------- AUDIT ----------
    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // ---------- JPA CALLBACKS ----------
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
        log.debug("User entity created | username={}", username);
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        log.debug("User entity updated | id={}", id);
    }
}
