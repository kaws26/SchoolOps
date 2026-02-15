package com.schoolOps.SchoolOPS.entity;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(
        name = "attendence",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"course_id", "date"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"teacher", "course", "students"})
@Slf4j
public class Attendence {

    // =================================================
    // PRIMARY KEY
    // =================================================
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =================================================
    // ATTENDANCE DETAILS
    // =================================================
    @Column(nullable = false)
    private LocalDate date;

    // =================================================
    // RELATIONSHIPS
    // =================================================

    // Many attendance records can belong to one teacher
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    // Many attendance records can belong to one course
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    // Attendance can contain multiple students
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "attendance_students",
            joinColumns = @JoinColumn(name = "attendance_id"),
            inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    private List<Student> students;

    // =================================================
    // JPA CALLBACKS
    // =================================================

    @PrePersist
    protected void onCreate() {
        log.debug(
                "Attendance created | courseId={} | teacherId={} | date={}",
                course != null ? course.getId() : null,
                teacher != null ? teacher.getId() : null,
                date
        );
    }

    @PreUpdate
    protected void onUpdate() {
        log.debug(
                "Attendance updated | id={} | courseId={}",
                id,
                course != null ? course.getId() : null
        );
    }
}