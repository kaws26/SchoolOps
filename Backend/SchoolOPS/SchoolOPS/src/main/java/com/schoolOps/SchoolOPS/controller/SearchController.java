package com.schoolOps.SchoolOPS.controller;


import java.util.List;

import com.schoolOps.SchoolOPS.dto.StudentResponseDto;
import java.util.stream.Collectors;

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
    public ResponseEntity<List<StudentResponseDto>> searchStudentByName(
            @RequestParam String query
    ) {
        List<Student> students = studentService.searchByName(query);
        students.forEach(student -> {
            if (student.getCourses() != null) {
                student.getCourses().size();
            }
        });
        return ResponseEntity.ok(
                students.stream().map(StudentResponseDto::fromEntity).collect(Collectors.toList())
        );
    }

    // ---------------------------------------------
    // SEARCH STUDENTS BY COURSE
    // ---------------------------------------------
    @PostMapping("/students/by-course")
    public ResponseEntity<List<StudentResponseDto>> searchStudentByCourse(
            @RequestParam Long courseId
    ) {
        List<Student> students = studentService.getStudentsByCourse(courseId);
        students.forEach(student -> {
            if (student.getCourses() != null) {
                student.getCourses().size();
            }
        });
        return ResponseEntity.ok(
                students.stream().map(StudentResponseDto::fromEntity).collect(Collectors.toList())
        );
    }
}

