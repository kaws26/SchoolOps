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
import org.springframework.web.multipart.MultipartFile;

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
    private final CloudinaryService cloudinaryService;


    // ---------- CREATE / UPDATE ----------
    public Course saveCourse(Course course, MultipartFile image) {

        // Upload image if provided
        if (image != null && !image.isEmpty()) {
            var upload = cloudinaryService.uploadImage(image);

            course.setImageUrl(upload.get("secure_url").toString());
            course.setImagePublicId(upload.get("public_id").toString());
        }

        Course saved = courseRepository.save(course);

        if (saved.getClassRoom() == null) {
            classRoomService.createClassRoom(saved);
        }

        log.info("Course created | courseId={}", saved.getId());
        return saved;
    }


    public Course updateCourse(Course course, MultipartFile image) {

        Course existing = courseRepository.findById(course.getId())
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Course not found with id: " + course.getId()
                        )
                );

        // ---------- IMAGE UPDATE ----------
        if (image != null && !image.isEmpty()) {

            String oldPublicId = existing.getImagePublicId();

            // delete old image
            if (oldPublicId != null && !oldPublicId.isBlank()) {
                cloudinaryService.deleteImage(oldPublicId);
            }

            var upload = cloudinaryService.uploadImage(image);
            existing.setImageUrl(upload.get("secure_url").toString());
            existing.setImagePublicId(upload.get("public_id").toString());
        }

        // ---------- COURSE DATA UPDATE ----------
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

        // ---------- DELETE COURSE IMAGE ----------
        String imagePublicId = course.getImagePublicId();
        if (imagePublicId != null && !imagePublicId.isBlank()) {
            cloudinaryService.deleteImage(imagePublicId);
            log.info("Course image deleted | publicId={}", imagePublicId);
        }

        // ---------- DETACH FROM TEACHER ----------
        if (course.getTeacher() != null) {
            Teacher teacher = course.getTeacher();
            teacher.getCourses().remove(course);
            teacherRepository.save(teacher);
        }

        // ---------- DELETE CLASSROOM & CLASSWORK ----------
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

        // ---------- DELETE ATTENDANCE ----------
        if (course.getAttendence() != null) {
            course.getAttendence().forEach(a -> a.setStudents(null));
            attendenceRepository.deleteAll(course.getAttendence());
        }

        // ---------- DETACH FROM STUDENTS ----------
        if (course.getStudents() != null) {
            course.getStudents().forEach(student -> {
                student.getCourses().remove(course);
                studentRepository.save(student);
            });
        }

        // ---------- DELETE COURSE ----------
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
