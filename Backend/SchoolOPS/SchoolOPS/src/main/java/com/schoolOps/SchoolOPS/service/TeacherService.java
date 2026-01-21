package com.schoolOps.SchoolOPS.service;


import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.schoolOps.SchoolOPS.entity.*;
import com.schoolOps.SchoolOPS.repository.*;
import com.schoolOps.SchoolOPS.utils.SaveFile;
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
public class TeacherService {

    private final AttendenceRepository attendenceRepository;
    private final TeacherRepository teacherRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    // ---------- CREATE ----------
    public Teacher saveTeacher(Teacher teacher) {
        Teacher saved = teacherRepository.save(teacher);
        log.info("Teacher saved | id={}", saved.getId());
        return saved;
    }

    // ---------- READ ----------
    public Teacher getTeacherById(Long teacherId) {
        return teacherRepository.findById(teacherId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Teacher not found with id: " + teacherId)
                );
    }

    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    public Course getCourseById(Teacher teacher, Long courseId) {

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Course not found with id: " + courseId)
                );

        return teacher.getCourses() != null && teacher.getCourses().contains(course)
                ? course
                : null;
    }

    // ---------- UPDATE ----------
    public void updateTeacher(Teacher updated, MultipartFile file) {

        Teacher existing = getTeacherById(updated.getId());

        if (file != null && !file.isEmpty()) {
            if (existing.getProfile() != null) {
                SaveFile.deleteFile(existing.getProfile());
            }
            existing.setProfile(SaveFile.saveFile(file));
        }

        existing.setName(updated.getName());
        existing.setEmail(updated.getEmail());
        existing.setFatherName(updated.getFatherName());
        existing.setSalary(updated.getSalary());
        existing.setNumbers(updated.getNumbers());

        Address address = existing.getAddress();
        if (address != null && updated.getAddress() != null) {
            address.setCity(updated.getAddress().getCity());
            address.setStreet(updated.getAddress().getStreet());
            addressRepository.save(address);
        }

        teacherRepository.save(existing);
        log.info("Teacher updated | id={}", existing.getId());
    }

    // ---------- DELETE ----------
    public void deleteTeacher(Long teacherId) {

        Teacher teacher = getTeacherById(teacherId);

        // detach user
        User user = teacher.getUser();
        if (user != null) {
            user.setTeacher(null);
            userRepository.save(user);
        }

        // delete address
        if (teacher.getAddress() != null) {
            addressRepository.delete(teacher.getAddress());
            teacher.setAddress(null);
        }

        // detach courses & delete attendance
        if (teacher.getCourses() != null) {
            teacher.getCourses().forEach(course -> {

                if (course.getAttendence() != null) {
                    attendenceRepository.deleteAll(course.getAttendence());
                    course.setAttendence(null);
                }

                course.setTeacher(null);
                courseRepository.save(course);
            });
        }

        // delete profile image
        if (teacher.getProfile() != null) {
            SaveFile.deleteFile(teacher.getProfile());
        }

        teacher.setUser(null);
        teacherRepository.delete(teacher);

        log.info("Teacher deleted | id={}", teacherId);
    }

    // ---------- ATTENDANCE ----------
    public void markAttendence(List<Long> studentIds, Long courseId, Teacher teacher) {

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Course not found with id: " + courseId)
                );

        // present students
        List<Student> presentStudents = new ArrayList<>();

        if (course.getStudents() != null) {
            course.getStudents().forEach(student -> {
                if (studentIds.contains(student.getId())) {
                    presentStudents.add(student);
                }
            });
        }

        Attendence attendance = new Attendence();
        attendance.setCourse(course);
        attendance.setDate(LocalDate.now());
        attendance.setTeacher(teacher);
        attendance.setStudents(presentStudents);

        attendenceRepository.save(attendance);

        List<Attendence> attendences =
                course.getAttendence() != null
                        ? course.getAttendence()
                        : new ArrayList<>();

        attendences.add(attendance);
        course.setAttendence(attendences);
        courseRepository.save(course);

        log.info(
                "Attendance marked | courseId={} | teacherId={} | presentCount={}",
                courseId,
                teacher.getId(),
                presentStudents.size()
        );
    }
}

