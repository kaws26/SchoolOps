package com.schoolOps.SchoolOPS.repository;


import java.util.List;
import java.util.Optional;

import com.schoolOps.SchoolOPS.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;


public interface UserRepository extends JpaRepository<User, Long> {

    // ---------- AUTHENTICATION ----------
    Optional<User> findByUsername(String username);

    // ---------- ROLE BASED USERS ----------
    List<User> findByRole(String role);

    Optional<User> findByResetToken(String resetToken);


}

