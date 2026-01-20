package com.schoolOps.SchoolOPS.repository;


import java.util.List;

import com.schoolOps.SchoolOPS.entity.Gallery;
import org.springframework.data.jpa.repository.JpaRepository;


public interface GalleryRepository extends JpaRepository<Gallery, Long> {

    // ---------- ORDER BY DATE (ASC) ----------
    List<Gallery> findAllByOrderByDateAsc();
}

