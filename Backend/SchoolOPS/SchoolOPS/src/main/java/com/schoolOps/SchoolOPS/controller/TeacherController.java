package com.schoolOps.SchoolOPS.controller;


import java.security.Principal;
import java.util.List;

import com.schoolOps.SchoolOPS.dto.*;

import java.util.stream.Collectors;

import com.schoolOps.SchoolOPS.entity.*;
import com.schoolOps.SchoolOPS.service.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService teacherService;
    private final UserService userService;
    private final NoticeService noticeService;
    private final CourseService courseService;
    private final ClassRoomService classRoomService;

    // =================================================
    // TEACHER PROFILE
    // =================================================
    @GetMapping("/profile")
    public TeacherResponseDto getTeacherProfile(Principal principal) {
        User user = userService.getUserByUsername(principal.getName());
        Teacher teacher = user.getTeacher();
        // Ensure courses are loaded
        if (teacher.getCourses() != null) {
            teacher.getCourses().size();
        }
        return TeacherResponseDto.fromEntity(teacher);
    }

    // =================================================
    // COURSES
    // =================================================
    @GetMapping("/courses")
    public List<CourseResponseDto> getCourses(Principal principal) {
        Teacher teacher =
                userService.getUserByUsername(principal.getName()).getTeacher();
        List<Course> courses = teacher.getCourses();
        // Ensure students are loaded for each course
        courses.forEach(course -> {
            if (course.getStudents() != null) {
                course.getStudents().size();
            }
        });
        return courses.stream().map(CourseResponseDto::fromEntity).collect(Collectors.toList());
    }

    // =================================================
    // ATTENDANCE
    // =================================================
    @PostMapping("/attendance/{courseId}")
    public String markAttendance(
            @PathVariable Long courseId,
            @RequestBody List<Long> studentIds,
            Principal principal
    ) {
        Teacher teacher =
                userService.getUserByUsername(principal.getName()).getTeacher();

        teacherService.markAttendence(studentIds, courseId, teacher);
        return "Attendance marked";
    }

    @GetMapping("/attendance/{courseId}")
    public List<AttendenceResponseDto> getAttendance(
            @PathVariable Long courseId,
            Principal principal
    ) {
        Teacher teacher =
                userService.getUserByUsername(principal.getName()).getTeacher();

        Course course =
                teacherService.getCourseById(teacher, courseId);

        List<Attendence> attendences = course.getAttendence();
        // Ensure students are loaded
        attendences.forEach(att -> {
            if (att.getStudents() != null) {
                att.getStudents().size();
            }
        });
        return attendences.stream().map(AttendenceResponseDto::fromEntity).collect(Collectors.toList());
    }

    // =================================================
    // NOTICE BOARD
    // =================================================
    @GetMapping("/notices")
    public List<NoticeResponseDto> getNotices() {
        return noticeService.getAllSortedNotice().stream().map(NoticeResponseDto::fromEntity).collect(Collectors.toList());
    }

    // =================================================
    // CLASSROOM
    // =================================================
    @GetMapping("/classroom/{courseId}")
    public List<ClassWorkResponseDto> getClassroom(
            @PathVariable Long courseId
    ) {
        Course course = courseService.getCourseById(courseId);
        List<ClassWork> classWorks = course.getClassRoom().getClasswork();
        // Ensure works are loaded
        classWorks.forEach(cw -> {
            if (cw.getWorks() != null) {
                cw.getWorks().size();
            }
        });
        return classWorks.stream().map(ClassWorkResponseDto::fromEntity).collect(Collectors.toList());
    }

    // -------------------------------------------------
    // ADD CLASSWORK
    // -------------------------------------------------
    @PostMapping("/classroom/classwork")
    public String addClassWork(
            @RequestPart("classWork") ClassWork classWork,
            @RequestParam Long courseId,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        classRoomService.postClassWork(classWork, courseId, file);
        return "Classwork added";
    }

    // -------------------------------------------------
    // DELETE CLASSWORK
    // -------------------------------------------------
    @DeleteMapping("/classroom/classwork/{classWorkId}")
    public String deleteClassWork(
            @PathVariable Long classWorkId
    ) {
        classRoomService.deleteClassWork(classWorkId);
        return "Classwork deleted";
    }

    // -------------------------------------------------
    // UPDATE MARKS
    // -------------------------------------------------
    @PutMapping("/classroom/work")
    public String updateMarks(
            @RequestBody Work work
    ) {
        classRoomService.updateMarks(work);
        return "Marks updated";
    }
}
