package com.schoolOps.SchoolOPS.controller;


import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.schoolOps.SchoolOPS.entity.*;
import com.schoolOps.SchoolOPS.service.*;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AccountService accountService;
    private final StudentService studentService;
    private final TeacherService teacherService;
    private final CourseService courseService;
    private final UserService userService;
    private final EnqueryService enqueryService;
    private final NoticeService noticeService;
    private final GalleryService galleryService;

    // =================================================
    // TEACHERS
    // =================================================

    @GetMapping("/teachers")
    public ResponseEntity<List<Teacher>> getAllTeachers() {
        return ResponseEntity.ok(teacherService.getAllTeachers());
    }

    @PostMapping("/teachers")
    public ResponseEntity<Teacher> addTeacher(@RequestBody Teacher teacher) {
        return ResponseEntity.ok(teacherService.saveTeacher(teacher));
    }

    @PutMapping("/teachers/{id}")
    public ResponseEntity<Void> updateTeacher(
            @PathVariable Long id,
            @RequestPart("teacher") Teacher teacher,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        teacher.setId(id);
        teacherService.updateTeacher(teacher, file);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/teachers/{id}")
    public ResponseEntity<Void> deleteTeacher(@PathVariable Long id) {
        teacherService.deleteTeacher(id);
        return ResponseEntity.noContent().build();
    }

    // =================================================
    // COURSES
    // =================================================

    @GetMapping("/courses")
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @PostMapping("/courses")
    public ResponseEntity<Course> addCourse(@RequestBody Course course) {
        return ResponseEntity.ok(courseService.saveCourse(course));
    }

    @PutMapping("/courses/{id}")
    public ResponseEntity<Course> updateCourse(
            @PathVariable Long id,
            @RequestBody Course course
    ) {
        course.setId(id);
        return ResponseEntity.ok(courseService.updateCourse(course));
    }

    @DeleteMapping("/courses/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/courses/{courseId}/assign-teacher/{teacherId}")
    public ResponseEntity<Void> assignTeacher(
            @PathVariable Long courseId,
            @PathVariable Long teacherId
    ) {
        courseService.assignCourse(teacherId, courseId);
        return ResponseEntity.ok().build();
    }

    // =================================================
    // STUDENTS
    // =================================================

    @GetMapping("/students")
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @PostMapping("/students")
    public ResponseEntity<Student> addStudent(@RequestBody Student student) {
        student.setAddBy("BY_ADMIN");
        return ResponseEntity.ok(studentService.saveStudent(student));
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<Void> updateStudent(
            @PathVariable Long id,
            @RequestPart("student") Student student,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        student.setId(id);
        studentService.updateStudent(student, file);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/students/{studentId}/courses/{courseId}")
    public ResponseEntity<Void> addCourseToStudent(
            @PathVariable Long studentId,
            @PathVariable Long courseId
    ) {
        studentService.addCourseToStudent(courseId, studentId);
        return ResponseEntity.ok().build();
    }

    // =================================================
    // USERS
    // =================================================

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/users")
    public ResponseEntity<User> addUser(@RequestBody User user) {
        return ResponseEntity.ok(userService.addNewUser(user));
    }

    // =================================================
    // ENQUIRIES
    // =================================================

    @GetMapping("/enquiries")
    public ResponseEntity<List<Enquery>> getEnquiries() {
        return ResponseEntity.ok(enqueryService.getAllEnquery());
    }

    @DeleteMapping("/enquiries/{id}")
    public ResponseEntity<Void> deleteEnquiry(@PathVariable Long id) {
        enqueryService.deleteEnquery(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/enquiries/{id}/status")
    public ResponseEntity<Void> updateEnquiryStatus(@PathVariable Long id) {
        enqueryService.setEnqueryStatus(id, "RESPONDED");
        return ResponseEntity.ok().build();
    }

    // =================================================
    // NOTICE BOARD
    // =================================================

    @GetMapping("/notices")
    public ResponseEntity<List<Notice>> getNotices() {
        return ResponseEntity.ok(noticeService.getAllSortedNotice());
    }

    @PostMapping("/notices")
    public ResponseEntity<Void> createNotice(
            @RequestPart("notice") Notice notice,
            @RequestPart(value = "file", required = false) MultipartFile file,
            Principal principal
    ) {
        User admin = userService.getUserByUsername(principal.getName());
        notice.setIssueby(admin.getName());
        noticeService.saveNoticeWithFile(notice, file);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/notices/{id}")
    public ResponseEntity<Void> deleteNotice(@PathVariable Long id) {
        noticeService.deleteNotice(id);
        return ResponseEntity.noContent().build();
    }

    // =================================================
    // GALLERY
    // =================================================

    @GetMapping("/gallery")
    public ResponseEntity<List<Gallery>> getGallery() {
        return ResponseEntity.ok(galleryService.getAllByDate());
    }

    @PostMapping("/gallery")
    public ResponseEntity<Void> uploadGallery(
            @RequestPart("gallery") Gallery gallery,
            @RequestPart("file") MultipartFile file
    ) {
        galleryService.saveToGallery(gallery, file);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/gallery/{id}")
    public ResponseEntity<Void> deleteGallery(@PathVariable Long id) {
        galleryService.deleteGallery(id);
        return ResponseEntity.noContent().build();
    }
}

