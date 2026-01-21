package com.schoolOps.SchoolOPS.controller;


import java.security.Principal;

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
    public User getLoggedInUser(Principal principal) {
        return userService.getUserByUsername(principal.getName());
    }
}

