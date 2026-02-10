package com.schoolOps.SchoolOPS.utils;

import java.security.SecureRandom;


import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
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

    @Value("${app.frontend.reset-password-url}")
    private String resetPasswordBaseUrl;
    // example: https://schoolops.com/reset-password

    // =====================================================
    // OTP EMAIL (PLAIN TEXT - OPTIONAL / LEGACY)
    // =====================================================
    public int sendOtp(String email) {

        int otp = 100000 + RANDOM.nextInt(900000);

        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setFrom(fromEmail);
        mail.setTo(email);
        mail.setSubject("OTP for Email Verification - SchoolOps");
        mail.setText(
                "Your OTP for email verification is:\n\n"
                        + otp
                        + "\n\nThis OTP is valid for a short time only."
        );

        javaMailSender.send(mail);
        log.debug("OTP email (plain text) sent to {}", email);

        return otp;
    }

    // =====================================================
    // OTP EMAIL (HTML - RECOMMENDED)
    // =====================================================
    public int sendOtpHtml(String email) {

        int otp = 100000 + RANDOM.nextInt(900000);

        String bodyHtml = """
            <h2 style="margin-top:0;">Email Verification</h2>
            <p style="font-size:15px; line-height:1.6;">
                Use the OTP below to verify your email address:
            </p>
            <div style="
                font-size:28px;
                font-weight:700;
                letter-spacing:4px;
                text-align:center;
                margin:20px 0;
                color:#1e3a8a;">
                %d
            </div>
        """.formatted(otp);

        String html = buildEmailTemplate(
                "SchoolOps",
                "Secure Verification",
                bodyHtml,
                null,
                null,
                "This OTP is valid for a short time only. Do not share it with anyone."
        );

        sendHtmlMail(email, "OTP Verification | SchoolOps", html);
        return otp;
    }

    // =====================================================
    // PASSWORD RESET EMAIL (FIRST LOGIN)
    // =====================================================
    public void sendPasswordResetMail(String toEmail, String resetToken) {

        String resetLink = resetPasswordBaseUrl + "?token=" + resetToken;

        String bodyHtml = """
            <h2 style="margin-top:0;">Welcome to SchoolOps 👋</h2>
            <p style="font-size:15px; line-height:1.6;">
                Your account has been created successfully.
            </p>
            <p style="font-size:15px; line-height:1.6;">
                Please set your password to activate your account.
            </p>
        """;

        String html = buildEmailTemplate(
                "SchoolOps",
                "School Management System",
                bodyHtml,
                "Set Your Password",
                resetLink,
                "⚠️ This link is valid for 24 hours. Please do not share it with anyone."
        );

        sendHtmlMail(toEmail, "Set Your Password | SchoolOps", html);
    }

    // =====================================================
    // COMMON HTML MAIL SENDER
    // =====================================================
    private void sendHtmlMail(String to, String subject, String htmlContent) {

        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            javaMailSender.send(message);
            log.info("HTML email sent to {}", to);

        } catch (Exception e) {
            log.error("Failed to send email to {}", to, e);
            throw new RuntimeException("Email sending failed");
        }
    }

    // =====================================================
    // COMMON HTML + CSS TEMPLATE (REUSABLE)
    // =====================================================
    private String buildEmailTemplate(
            String title,
            String subtitle,
            String bodyHtml,
            String buttonText,
            String buttonLink,
            String footerNote
    ) {

        String buttonSection = "";
        if (buttonText != null && buttonLink != null) {
            buttonSection = """
                <div style="text-align:center; margin:30px 0;">
                    <a href="%s"
                       style="
                       background:#2563eb;
                       color:#ffffff;
                       text-decoration:none;
                       padding:14px 28px;
                       border-radius:6px;
                       font-size:15px;
                       font-weight:600;
                       display:inline-block;
                       ">
                        %s
                    </a>
                </div>
            """.formatted(buttonLink, buttonText);
        }

        return """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>%s</title>
        </head>
        <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">

            <table width="100%%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
                <tr>
                    <td align="center">

                        <table width="600" cellpadding="0" cellspacing="0"
                               style="background:#ffffff; border-radius:10px;
                               box-shadow:0 6px 20px rgba(0,0,0,0.08);
                               overflow:hidden;">

                            <!-- Header -->
                            <tr>
                                <td style="background:#1e3a8a; padding:24px; text-align:center;">
                                    <h1 style="margin:0; color:#ffffff; font-size:24px;">
                                        %s
                                    </h1>
                                    <p style="margin:6px 0 0; color:#dbeafe; font-size:14px;">
                                        %s
                                    </p>
                                </td>
                            </tr>

                            <!-- Body -->
                            <tr>
                                <td style="padding:32px; color:#1f2937;">
                                    %s
                                    %s
                                    <hr style="border:none; border-top:1px solid #e5e7eb; margin:30px 0;">
                                    <p style="font-size:13px; color:#6b7280;">
                                        %s
                                    </p>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="background:#f9fafb; padding:18px; text-align:center;">
                                    <p style="margin:0; font-size:12px; color:#9ca3af;">
                                        © 2026 SchoolOps. All rights reserved.
                                    </p>
                                </td>
                            </tr>

                        </table>

                    </td>
                </tr>
            </table>

        </body>
        </html>
        """.formatted(
                title,
                title,
                subtitle,
                bodyHtml,
                buttonSection,
                footerNote
        );
    }
}
