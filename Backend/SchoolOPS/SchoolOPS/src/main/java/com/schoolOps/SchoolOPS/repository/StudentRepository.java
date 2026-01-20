package com.schoolOps.SchoolOPS.repository;


import java.util.List;
import java.util.Optional;

import com.schoolOps.SchoolOPS.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;


public interface StudentRepository extends JpaRepository<Student, Long> {

    // ---------- GET LAST REGISTRATION NUMBER ----------
    @Query("select max(s.registrationNo) from Student s")
    Optional<Integer> findMaxRegistrationNo();

    // ---------- SEARCH STUDENTS BY NAME ----------
    List<Student> findByNameStartingWithIgnoreCase(String name);
}

