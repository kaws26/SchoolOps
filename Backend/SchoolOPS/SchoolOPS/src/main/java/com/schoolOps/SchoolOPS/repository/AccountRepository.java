package com.schoolOps.SchoolOPS.repository;


import java.util.List;
import java.util.Optional;

import com.schoolOps.SchoolOPS.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;


public interface AccountRepository extends JpaRepository<Account, Long> {

    // ---------- FIND BY ID ----------
    Optional<Account> findById(Long id);

    // ---------- SEARCH BY STUDENT NAME ----------
    List<Account> findByStudent_NameContainingIgnoreCase(String name);
}

