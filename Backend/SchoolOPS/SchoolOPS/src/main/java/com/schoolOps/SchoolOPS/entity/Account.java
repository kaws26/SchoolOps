package com.schoolOps.SchoolOPS.entity;


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
@ToString(exclude = {"user", "student", "transactions"})
@Slf4j
public class Account {

    // ---------- PRIMARY KEY ----------
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long acid;

    // ---------- RELATIONSHIPS ----------
    @OneToOne(fetch = FetchType.LAZY)
    private Student student;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    private User user;

    @OneToMany(
            mappedBy = "account",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<Transaction> transactions;

    // ---------- ACCOUNT DETAILS ----------
    @Column(nullable = false)
    private float accountBalance;

    // ---------- JPA CALLBACKS ----------
    @PrePersist
    protected void onCreate() {
        log.debug("Account created");
    }

    @PreUpdate
    protected void onUpdate() {
        log.debug("Account updated | id={}", acid);
    }
}

