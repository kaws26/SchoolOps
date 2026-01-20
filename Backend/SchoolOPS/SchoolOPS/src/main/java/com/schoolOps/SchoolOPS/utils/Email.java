package com.schoolOps.SchoolOPS.utils;


import java.security.SecureRandom;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class Email {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public int sendOtp(String email) {

        int otp = 100000 + RANDOM.nextInt(900000); // 6-digit OTP

        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setFrom(fromEmail);
        mail.setTo(email);
        mail.setSubject("OTP for Email Verification - SSMS");
        mail.setText("Your OTP for Email Verification is: " + otp);

        javaMailSender.send(mail);

        log.debug("OTP email sent successfully to {}", email);

        return otp;
    }
}

