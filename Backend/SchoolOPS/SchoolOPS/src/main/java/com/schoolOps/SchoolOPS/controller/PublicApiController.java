package com.schoolOps.SchoolOPS.controller;


import java.text.SimpleDateFormat;
import java.util.List;
import java.util.Map;

import com.schoolOps.SchoolOPS.dto.CourseResponseDto;
import com.schoolOps.SchoolOPS.dto.GalleryResponseDto;
import com.schoolOps.SchoolOPS.dto.EnqueryRequestDto;
import java.util.stream.Collectors;

import com.schoolOps.SchoolOPS.entity.Course;
import com.schoolOps.SchoolOPS.entity.Enquery;
import com.schoolOps.SchoolOPS.entity.User;
import com.schoolOps.SchoolOPS.service.CourseService;
import com.schoolOps.SchoolOPS.service.EnqueryService;
import com.schoolOps.SchoolOPS.service.GalleryService;
import com.schoolOps.SchoolOPS.service.UserService;
import com.schoolOps.SchoolOPS.utils.Email;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicApiController {

    private final EnqueryService enqueryService;
    private final CourseService courseService;
    private final UserService userService;
    private final Email emailService;
    private final GalleryService galleryService;

    // =================================================
    // HOME DATA
    // =================================================
    @GetMapping("/home")
    public ResponseEntity<?> homeData() {
        List<Course> courses = courseService.getAllCourses();
        // Ensure students are loaded
        courses.forEach(course -> {
            if (course.getStudents() != null) {
                course.getStudents().size();
            }
        });
        List<CourseResponseDto> courseDtos = courses.stream().map(CourseResponseDto::fromEntity).collect(Collectors.toList());
        return ResponseEntity.ok(
                Map.of("courses", courseDtos)
        );
    }

    // =================================================
    // STATIC PAGES DATA (optional)
    // =================================================
    @GetMapping("/gallery")
    public ResponseEntity<List<GalleryResponseDto>> gallery() {
        return ResponseEntity.ok(galleryService.getAllByDate().stream().map(GalleryResponseDto::fromEntity).collect(Collectors.toList()));
    }

    // =================================================
    // SEND OTP
    // =================================================
    @PostMapping("/otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> data) {

        String email = data.get("email");
        int otp = emailService.sendOtp(email);

        // ⚠️ In production, store OTP in Redis / DB with TTL
        return ResponseEntity.ok(
                Map.of("message", "OTP sent successfully", "otp", otp)
        );
    }

    // =================================================
    // SIGNUP
    // =================================================
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> payload) {

        try {
            User user = new User();
            user.setUsername(payload.get("email"));
            user.setPassword(payload.get("password"));
            user.setName(payload.get("name"));
            user.setEnabled(true);
            user.setRole(payload.get("role"));

            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            user.setDob(sdf.parse(payload.get("dob")));

            userService.addNewUser(user);

            return ResponseEntity.ok(
                    Map.of("message", "User registered successfully")
            );

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Invalid data")
            );
        }
    }

    // =================================================
    // ENQUERY
    // =================================================
    @PostMapping("/enquery")
    public ResponseEntity<?> submitEnquery(@RequestBody EnqueryRequestDto enqueryDto) {
        Enquery enquery = enqueryDto.toEntity();
        enqueryService.saveEnquery(enquery);
        return ResponseEntity.ok(
                Map.of("message", "Enquiry submitted successfully")
        );
    }
}

