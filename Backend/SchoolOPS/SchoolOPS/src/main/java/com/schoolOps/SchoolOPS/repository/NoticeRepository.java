package com.schoolOps.SchoolOPS.repository;

import java.util.List;

import com.schoolOps.SchoolOPS.entity.Notice;
import org.springframework.data.jpa.repository.JpaRepository;


public interface NoticeRepository extends JpaRepository<Notice, Long> {

    // ---------- FETCH ALL NOTICES (LATEST FIRST) ----------
    List<Notice> findAllByOrderByDateDesc();
}

