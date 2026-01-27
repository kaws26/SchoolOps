package com.schoolOps.SchoolOPS.controller;


import java.security.Principal;

import com.schoolOps.SchoolOPS.dto.UserResponseDto;
import com.schoolOps.SchoolOPS.entity.User;
import com.schoolOps.SchoolOPS.service.UserService;
import org.springframework.web.bind.annotation.*;


import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // =================================================
    // LOGGED-IN USER PROFILE
    // =================================================
    @GetMapping("/profile")
    public UserResponseDto getLoggedInUser(Principal principal) {
        User user = userService.getUserByUsername(principal.getName());
        if (user.getStudent() != null && user.getStudent().getCourses() != null) {
            user.getStudent().getCourses().size();
        }
        if (user.getTeacher() != null && user.getTeacher().getCourses() != null) {
            user.getTeacher().getCourses().size();
        }
        return UserResponseDto.fromEntity(user);
    }
}

