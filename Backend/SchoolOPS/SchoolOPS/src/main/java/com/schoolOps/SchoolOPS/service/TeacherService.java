package com.schoolOps.SchoolOPS.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.schoolOps.SchoolOPS.dto.TeacherRequestDto;
import com.schoolOps.SchoolOPS.entity.*;
import com.schoolOps.SchoolOPS.repository.*;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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
    private final CloudinaryService cloudinaryService;

    // ---------- CREATE ----------
    @Transactional
    public Teacher createTeacher(TeacherRequestDto dto, MultipartFile file) {

        Teacher teacher = dto.toEntity();
        // Upload profile image to Cloudinary (if provided)
        if (file != null && !file.isEmpty()) {
            Map<String, Object> uploadResult = cloudinaryService.uploadImage(file);

            teacher.setProfileImageUrl(
                    uploadResult.get("secure_url").toString()
            );
            teacher.setProfileImagePublicId(
                    uploadResult.get("public_id").toString()
            );
        }

        Teacher savedTeacher = teacherRepository.save(teacher);

        log.info("Teacher created successfully | id={}", savedTeacher.getId());

        return savedTeacher;
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
    public void updateTeacher(Long id, TeacherRequestDto dto, MultipartFile file) {

        Teacher existing = getTeacherById(id);

        if (file != null && !file.isEmpty()) {

            String oldPublicId = existing.getProfileImagePublicId();

            if (oldPublicId != null && !oldPublicId.isBlank()) {
                cloudinaryService.deleteImage(oldPublicId);
            }


            Map<String, Object> upload = cloudinaryService.uploadImage(file);
            existing.setProfileImageUrl(upload.get("secure_url").toString());
            existing.setProfileImagePublicId(upload.get("public_id").toString());
        }

        existing.setName(dto.getName());
        existing.setEmail(dto.getEmail());
        existing.setFatherName(dto.getFatherName());
        existing.setSalary(dto.getSalary());
        existing.setNumbers(dto.getNumbers());
        existing.setDate(dto.getDate());

        if (dto.getAddress() != null) {

            if (existing.getAddress() == null) {
                // Create new address
                Address address = new Address();
                address.setCity(dto.getAddress().getCity());
                address.setStreet(dto.getAddress().getStreet());

                existing.setAddress(address); // IMPORTANT
            } else {
                // Update existing address
                existing.getAddress().setCity(dto.getAddress().getCity());
                existing.getAddress().setStreet(dto.getAddress().getStreet());
            }
        }


        teacherRepository.save(existing);
        log.info("Teacher updated | id={}", id);
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

        cloudinaryService.deleteImage(teacher.getProfileImagePublicId());

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
