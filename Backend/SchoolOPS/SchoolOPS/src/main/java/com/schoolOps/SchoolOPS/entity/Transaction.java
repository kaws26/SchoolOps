package com.schoolOps.SchoolOPS.entity;


import java.time.LocalDateTime;

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
@ToString(exclude = {"account"})
@Slf4j
public class Transaction {

    // ---------- PRIMARY KEY ----------
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ---------- RELATIONSHIPS ----------
    @ManyToOne(fetch = FetchType.LAZY)
    private Account account;

    // ---------- TRANSACTION DETAILS ----------
    @Column(nullable = false, length = 30)
    private String type;

    @Column(length = 255)
    private String remarks;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(length = 40)
    private String mode;

    @Column(nullable = false)
    private float balance;

    @Column(nullable = false)
    private float amount;

    // ---------- JPA CALLBACKS ----------
    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
        log.debug("Transaction created | type={}, amount={}", type, amount);
    }

    @PreUpdate
    protected void onUpdate() {
        log.debug("Transaction updated | id={}", id);
    }
}

