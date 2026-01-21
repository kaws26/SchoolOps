package com.schoolOps.SchoolOPS.service;


import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.schoolOps.SchoolOPS.entity.ClassRoom;
import com.schoolOps.SchoolOPS.entity.ClassWork;
import com.schoolOps.SchoolOPS.entity.Course;
import com.schoolOps.SchoolOPS.entity.Work;
import com.schoolOps.SchoolOPS.repository.ClassRoomRepository;
import com.schoolOps.SchoolOPS.repository.ClassWorkRepository;
import com.schoolOps.SchoolOPS.repository.CourseRepository;
import com.schoolOps.SchoolOPS.repository.WorkRepository;
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
public class ClassRoomService {

    private final ClassRoomRepository classRoomRepository;
    private final ClassWorkRepository classWorkRepository;
    private final CourseRepository courseRepository;
    private final WorkRepository workRepository;

    // ---------- CLASSROOM ----------
    public ClassRoom createClassRoom(Course course) {
        ClassRoom classRoom = new ClassRoom();
        classRoom.setCourse(course);

        ClassRoom saved = classRoomRepository.save(classRoom);
        log.info("ClassRoom created | courseId={}", course.getId());

        return saved;
    }

    // ---------- CLASSWORK ----------
    public void postClassWork(ClassWork classWork, Long courseId, MultipartFile file) {

        if (file != null && !file.isEmpty()) {
            String filename = SaveFile.saveFile(file);
            classWork.setReference(filename);
        }

        classWork.setCreatedAt(LocalDateTime.now());

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Course not found with id: " + courseId)
                );

        ClassRoom classRoom = course.getClassRoom();
        if (classRoom == null) {
            throw new EntityNotFoundException("ClassRoom not found for course id: " + courseId);
        }

        classWork.setClassRoom(classRoom);

        List<ClassWork> classWorks =
                classRoom.getClasswork() != null
                        ? classRoom.getClasswork()
                        : new ArrayList<>();

        classWorks.add(classWork);
        classRoom.setClasswork(classWorks);

        classWorkRepository.save(classWork);
        classRoomRepository.save(classRoom);

        log.info("ClassWork posted | courseId={} | title={}", courseId, classWork.getTitle());
    }

    public void deleteClassWork(Long classWorkId) {

        ClassWork classWork = classWorkRepository.findById(classWorkId)
                .orElseThrow(() ->
                        new EntityNotFoundException("ClassWork not found with id: " + classWorkId)
                );

        if (classWork.getReference() != null) {
            SaveFile.deleteFile(classWork.getReference());
        }

        classWorkRepository.delete(classWork);
        log.info("ClassWork deleted | id={}", classWorkId);
    }

    public ClassWork getClassWorkById(Long classWorkId) {
        return classWorkRepository.findById(classWorkId)
                .orElseThrow(() ->
                        new EntityNotFoundException("ClassWork not found with id: " + classWorkId)
                );
    }

    // ---------- STUDENT WORK ----------
    public void saveWork(MultipartFile file, Work work) {

        if (file != null && !file.isEmpty()) {
            String savedName = SaveFile.saveFile(file);
            work.setWork(savedName);
        }

        ClassWork classWork = work.getClassWork();
        if (classWork == null) {
            throw new IllegalArgumentException("ClassWork must be set before saving Work");
        }

        List<Work> works =
                classWork.getWorks() != null
                        ? classWork.getWorks()
                        : new ArrayList<>();

        Work savedWork = workRepository.save(work);
        works.add(savedWork);
        classWork.setWorks(works);

        classWorkRepository.save(classWork);

        log.info("Work submitted | classWorkId={} | studentId={}",
                classWork.getId(),
                work.getStudent() != null ? work.getStudent().getId() : null
        );
    }

    public void updateMarks(Work work) {

        Work existing = workRepository.findById(work.getId())
                .orElseThrow(() ->
                        new EntityNotFoundException("Work not found with id: " + work.getId())
                );

        existing.setMarks(work.getMarks());
        workRepository.save(existing);

        log.info("Marks updated | workId={} | marks={}", work.getId(), work.getMarks());
    }
}
