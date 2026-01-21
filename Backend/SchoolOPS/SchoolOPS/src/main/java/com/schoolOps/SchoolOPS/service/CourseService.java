package com.schoolOps.SchoolOPS.service;


import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.schoolOps.SchoolOPS.entity.*;
import com.schoolOps.SchoolOPS.repository.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CourseService {

    private final TeacherRepository teacherRepository;
    private final CourseRepository courseRepository;
    private final ClassRoomRepository classRoomRepository;
    private final ClassRoomService classRoomService;
    private final ClassWorkRepository classWorkRepository;
    private final WorkRepository workRepository;
    private final AttendenceRepository attendenceRepository;
    private final StudentRepository studentRepository;
    private final AccountService accountService;

    // ---------- CREATE / UPDATE ----------
    public Course saveCourse(Course course) {

        Course saved = courseRepository.save(course);

        if (saved.getClassRoom() == null) {
            classRoomService.createClassRoom(saved);
        }

        log.info("Course saved | courseId={}", saved.getId());
        return saved;
    }

    public Course updateCourse(Course course) {

        Course existing = courseRepository.findById(course.getId())
                .orElseThrow(() ->
                        new EntityNotFoundException("Course not found with id: " + course.getId())
                );

        existing.setName(course.getName());
        existing.setFees(course.getFees());
        existing.setSession(course.getSession());
        existing.setDuration(course.getDuration());
        existing.setAbout(course.getAbout());
        existing.setTime(course.getTime());

        Course updated = courseRepository.save(existing);

        log.info("Course updated | courseId={}", updated.getId());
        return updated;
    }

    // ---------- DELETE ----------
    public void deleteCourse(Long courseId) {

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Course not found with id: " + courseId)
                );

        // Detach from teacher
        if (course.getTeacher() != null) {
            Teacher teacher = course.getTeacher();
            teacher.getCourses().remove(course);
            teacherRepository.save(teacher);
        }

        // Delete classroom & classwork
        if (course.getClassRoom() != null) {
            ClassRoom classRoom = course.getClassRoom();

            if (classRoom.getClasswork() != null) {
                classRoom.getClasswork().forEach(cw ->
                        workRepository.deleteAll(cw.getWorks())
                );
                classWorkRepository.deleteAll(classRoom.getClasswork());
            }

            classRoomRepository.delete(classRoom);
        }

        // Delete attendance
        if (course.getAttendence() != null) {
            course.getAttendence().forEach(a -> a.setStudents(null));
            attendenceRepository.deleteAll(course.getAttendence());
        }

        // Detach from students
        if (course.getStudents() != null) {
            course.getStudents().forEach(student -> {
                student.getCourses().remove(course);
                studentRepository.save(student);
            });
        }

        courseRepository.delete(course);

        log.info("Course deleted | courseId={}", courseId);
    }

    // ---------- FETCH ----------
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Course getCourseById(Long courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Course not found with id: " + courseId)
                );
    }

    // ---------- ASSIGN COURSE ----------
    public void assignCourse(Long teacherId, Long courseId) {

        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Teacher not found with id: " + teacherId)
                );

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Course not found with id: " + courseId)
                );

        course.setTeacher(teacher);
        courseRepository.save(course);

        // Ensure teacher account exists
        if (teacher.getAccount() == null) {
            accountService.openTeacherAccount(teacher);
        }

        Account account = teacher.getAccount();

        Transaction transaction = new Transaction();
        transaction.setType("COURSESTART");
        transaction.setAmount(0);
        transaction.setMode(String.valueOf(courseId));
        transaction.setRemarks(course.getName());
        transaction.setTimestamp(LocalDateTime.now());
        transaction.setAccount(account);

        List<Transaction> transactions =
                account.getTransactions() != null
                        ? account.getTransactions()
                        : new ArrayList<>();

        transactions.add(transaction);
        account.setTransactions(transactions);

        accountService.saveAccount(account);

        log.info(
                "Course assigned | courseId={} | teacherId={}",
                courseId,
                teacherId
        );
    }
}
