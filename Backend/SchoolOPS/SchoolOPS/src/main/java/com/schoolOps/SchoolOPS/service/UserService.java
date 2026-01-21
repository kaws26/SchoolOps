package com.schoolOps.SchoolOPS.service;


import java.security.SecureRandom;
import java.util.List;

import com.schoolOps.SchoolOPS.entity.User;
import com.schoolOps.SchoolOPS.repository.UserRepository;
import com.schoolOps.SchoolOPS.utils.Email;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final Email emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // ---------- READ ----------
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getUserByRole(String role) {
        return userRepository.findByRole(role);
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new EntityNotFoundException("User not found with id: " + userId)
                );
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new EntityNotFoundException("User not found with username: " + username)
                );
    }

    // ---------- CREATE ----------
    public User addNewUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User saved = userRepository.save(user);
        log.info("User created | id={} | role={}", saved.getId(), saved.getRole());
        return saved;
    }

    // ---------- OTP ----------
    public int sendOtp(User user) {
        int otp = emailService.sendOtp(user.getUsername());
        log.debug("OTP sent via Email service | username={}", user.getUsername());
        return otp;
    }
}

