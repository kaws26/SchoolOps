package com.schoolOps.SchoolOPS.service;


import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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

    // =================================================
    // READ
    // =================================================
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

    // =================================================
    // CREATE
    // =================================================
    public User addNewUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User saved = userRepository.save(user);
        log.info("User created | id={} | role={}", saved.getId(), saved.getRole());
        return saved;
    }

    // =================================================
    // SAVE (GENERIC)
    // =================================================
    public User save(User user) {
        User saved = userRepository.save(user);
        log.debug("User saved | id={}", saved.getId());
        return saved;
    }

    // =================================================
    // FIND BY RESET TOKEN
    // =================================================
    public Optional<User> findByResetToken(String resetToken) {
        return userRepository.findByResetToken(resetToken);
    }

    // =================================================
    // OTP
    // =================================================
    public int sendOtp(User user) {
        int otp = emailService.sendOtp(user.getUsername());
        log.debug("OTP sent via Email service | username={}", user.getUsername());
        return otp;
    }

    // =================================================
    // RESEND RESET PASSWORD LINK (OPTIONAL BUT USEFUL)
    // =================================================
    public void resendResetPasswordLink(User user) {

        String resetToken = generateResetToken();

        user.setResetToken(resetToken);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(24));
        userRepository.save(user);

        emailService.sendPasswordResetMail(
                user.getUsername(),
                resetToken
        );

        log.info("Password reset link resent | userId={}", user.getId());
    }

    // =================================================
    // HELPERS
    // =================================================
    private String generateResetToken() {
        return Long.toHexString(RANDOM.nextLong()) + Long.toHexString(RANDOM.nextLong());
    }
}
