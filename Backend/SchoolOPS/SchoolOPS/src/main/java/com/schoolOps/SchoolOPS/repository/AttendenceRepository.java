package com.schoolOps.SchoolOPS.repository;

import com.schoolOps.SchoolOPS.entity.Attendence;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendenceRepository extends JpaRepository<Attendence, Integer> {

}
