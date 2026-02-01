package com.schoolOps.SchoolOPS.controller;


import com.schoolOps.SchoolOPS.config.jwt.JwtUtil;

import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public Map<String, String> login(
            @RequestBody Map<String, String> request
    ) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.get("username"),
                        request.get("password")
                )
        );

        UserDetails userDetails =
                userDetailsService.loadUserByUsername(
                        request.get("username")
                );

        String token = jwtUtil.generateToken(userDetails);

        return Map.of("token", token);
    }
}

