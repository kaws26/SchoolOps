package com.schoolOps.SchoolOPS.controller;


import java.security.Principal;
import java.util.List;

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
    public Teacher getTeacherProfile(Principal principal) {
        User user = userService.getUserByUsername(principal.getName());
        return user.getTeacher();
    }

    // =================================================
    // COURSES
    // =================================================
    @GetMapping("/courses")
    public List<Course> getCourses(Principal principal) {
        Teacher teacher =
                userService.getUserByUsername(principal.getName()).getTeacher();
        return teacher.getCourses();
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
    public List<Attendence> getAttendance(
            @PathVariable Long courseId,
            Principal principal
    ) {
        Teacher teacher =
                userService.getUserByUsername(principal.getName()).getTeacher();

        Course course =
                teacherService.getCourseById(teacher, courseId);

        return course.getAttendence();
    }

    // =================================================
    // NOTICE BOARD
    // =================================================
    @GetMapping("/notices")
    public List<Notice> getNotices() {
        return noticeService.getAllSortedNotice();
    }

    // =================================================
    // CLASSROOM
    // =================================================
    @GetMapping("/classroom/{courseId}")
    public List<ClassWork> getClassroom(
            @PathVariable Long courseId
    ) {
        Course course = courseService.getCourseById(courseId);
        return course.getClassRoom().getClasswork();
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
