package com.schoolOps.SchoolOPS.controller;


import java.util.List;

import com.schoolOps.SchoolOPS.entity.Student;
import com.schoolOps.SchoolOPS.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/search")
@RequiredArgsConstructor
public class SearchController {

    private final StudentService studentService;

    // ---------------------------------------------
    // SEARCH STUDENTS BY NAME
    // ---------------------------------------------
    @PostMapping("/students/by-name")
    public ResponseEntity<List<Student>> searchStudentByName(
            @RequestParam String query
    ) {
        return ResponseEntity.ok(
                studentService.searchByName(query)
        );
    }

    // ---------------------------------------------
    // SEARCH STUDENTS BY COURSE
    // ---------------------------------------------
    @PostMapping("/students/by-course")
    public ResponseEntity<List<Student>> searchStudentByCourse(
            @RequestParam Long courseId
    ) {
        return ResponseEntity.ok(
                studentService.getStudentsByCourse(courseId)
        );
    }
}

