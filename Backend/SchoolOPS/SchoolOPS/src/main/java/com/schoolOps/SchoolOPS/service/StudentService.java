package com.schoolOps.SchoolOPS.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.schoolOps.SchoolOPS.entity.*;
import com.schoolOps.SchoolOPS.repository.*;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class StudentService {

    private final AccountService accountService;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final AttendenceRepository attendenceRepository;
    private final CloudinaryService cloudinaryService;

    // ---------- CREATE / UPDATE ----------
    public Student saveStudent(Student student) {

        if (student.getRegistrationNo() == 0) {
            student.setRegistrationNo(getNewRegNo());
        }

        Student saved = studentRepository.save(student);
        log.info("Student saved | id={}", saved.getId());
        return saved;
    }

    public void updateStudent(Student updated, MultipartFile file) {

        Student existing = studentRepository.findById(updated.getId())
                .orElseThrow(() ->
                        new EntityNotFoundException("Student not found with id: " + updated.getId())
                );

        if (file != null && !file.isEmpty()) {

            // delete old image if exists
            cloudinaryService.deleteImage(existing.getProfileImagePublicId());

            Map<String, Object> upload = cloudinaryService.uploadImage(file);
            existing.setProfileImageUrl(upload.get("secure_url").toString());
            existing.setProfileImagePublicId(upload.get("public_id").toString());
        }

        existing.setName(updated.getName());
        existing.setFatherName(updated.getFatherName());
        existing.setEmail(updated.getEmail());
        existing.setNumbers(updated.getNumbers());
        existing.setAddress(updated.getAddress());
        existing.setRollNo(updated.getRollNo());
        existing.setRegistrationNo(updated.getRegistrationNo());

        studentRepository.save(existing);
        log.info("Student updated | id={}", existing.getId());
    }

    // ---------- FETCH ----------
    public Student getStudentById(Long studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Student not found with id: " + studentId)
                );
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public List<Student> searchByName(String query) {
        return studentRepository.findByNameStartingWithIgnoreCase(query);
    }

    public List<Student> getStudentsByCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Course not found with id: " + courseId)
                );
        return course.getStudents();
    }

    // ---------- REG / ROLL NUMBERS ----------
    public int getNewRegNo() {
        return studentRepository.findMaxRegistrationNo().orElse(0) + 1;
    }

    public int getNewRollNo(Course course) {
        if (course.getStudents() == null || course.getStudents().isEmpty()) {
            return 1;
        }
        return course.getStudents()
                .stream()
                .mapToInt(Student::getRollNo)
                .max()
                .orElse(0) + 1;
    }

    // ---------- DELETE ----------
    public void deleteStudent(Long studentId) {

        Student student = getStudentById(studentId);

        // detach user
        User user = student.getUser();
        if (user != null) {
            user.setStudent(null);
            userRepository.save(user);
        }

        cloudinaryService.deleteImage(student.getProfileImagePublicId());

        // detach from courses & attendance
        if (student.getCourses() != null) {
            student.getCourses().forEach(course -> {

                if (course.getAttendence() != null) {
                    course.getAttendence().forEach(a -> {
                        a.getStudents().remove(student);
                        attendenceRepository.save(a);
                    });
                }

                course.getStudents().remove(student);
                courseRepository.save(course);
            });
        }

        // delete account & transactions
        if (student.getAccount() != null) {
            Account account = student.getAccount();
            if (account.getTransactions() != null) {
                transactionRepository.deleteAll(account.getTransactions());
            }
            accountService.deleteAccount(account);
        }

        studentRepository.delete(student);
        log.info("Student deleted | id={}", studentId);
    }

    // ---------- COURSE ASSIGN ----------
    public void addCourseToStudent(Long courseId, Long studentId) {

        Student student = getStudentById(studentId);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Course not found with id: " + courseId)
                );

        if (student.getCourses() == null) {
            student.setCourses(new ArrayList<>());
        }

        student.getCourses().add(course);

        if (student.getRollNo() == 0) {
            student.setRollNo(getNewRollNo(course));
        }

        course.getStudents().add(student);
        courseRepository.save(course);

        // financial transaction
        if (student.getAccount() == null) {
            accountService.openStudentAccount(student);
        }

        Transaction transaction = new Transaction();
        transaction.setRemarks(course.getName());
        transaction.setAmount(Float.parseFloat(course.getFees()));
        transaction.setType("DEBIT");
        transaction.setMode("ONLINE");

        accountService.makeTransaction(
                transaction,
                student.getAccount().getId()
        );

        log.info(
                "Course added to student | studentId={} | courseId={}",
                studentId,
                courseId
        );
    }

    // ---------- ATTENDANCE ----------
    public List<Attendence> getAttendence(Long courseId, Long studentId) {

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Course not found with id: " + courseId)
                );

        List<Attendence> result = new ArrayList<>();

        if (course.getAttendence() != null) {
            course.getAttendence().forEach(att ->
                    att.getStudents().forEach(s -> {
                        if (s.getId().equals(studentId)) {
                            result.add(att);
                        }
                    })
            );
        }

        return result;
    }
}
