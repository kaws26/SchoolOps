package com.schoolOps.SchoolOPS.controller;

import java.security.Principal;
import java.util.List;

import com.schoolOps.SchoolOPS.dto.AccountResponseDto;
import com.schoolOps.SchoolOPS.entity.Transaction;
import com.schoolOps.SchoolOPS.entity.User;
import com.schoolOps.SchoolOPS.service.AccountService;
import com.schoolOps.SchoolOPS.service.TeacherService;
import com.schoolOps.SchoolOPS.service.UserService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;
    private final UserService userService;
    private final TeacherService teacherService;

    // -------------------------------------------------
    // GET: ALL ACCOUNTS
    // -------------------------------------------------
    @GetMapping
    public ResponseEntity<List<AccountResponseDto>> getAllAccounts() {
        return ResponseEntity.ok(accountService.getAllAccounts());
    }

    // -------------------------------------------------
    // GET: SINGLE ACCOUNT
    // -------------------------------------------------
    @GetMapping("/{accountId}")
    public ResponseEntity<AccountResponseDto> getAccountById(
            @PathVariable Long accountId
    ) {
        return ResponseEntity.ok(
                accountService.getAccountById(accountId)
        );
    }

    // -------------------------------------------------
    // POST: MAKE TRANSACTION
    // -------------------------------------------------
    @PostMapping("/{accountId}/transactions")
    public ResponseEntity<Void> makeTransaction(
            @PathVariable Long accountId,
            @RequestBody Transaction transaction,
            Principal principal
    ) {

        User admin = userService.getUserByUsername(principal.getName());

        transaction.setRemarks(
                (transaction.getRemarks() != null ? transaction.getRemarks() : "")
                        + " / " + admin.getName()
        );

        accountService.makeTransaction(transaction, accountId);

        return ResponseEntity.ok().build();
    }

    // -------------------------------------------------
    // POST: SEARCH ACCOUNTS
    // -------------------------------------------------
    @PostMapping("/search")
    public ResponseEntity<List<AccountResponseDto>> searchAccounts(
            @RequestParam String query
    ) {
        return ResponseEntity.ok(
                accountService.searchAccount(query)
        );
    }

    // -------------------------------------------------
    // GET: PAYROLL DATA FOR TEACHER
    // -------------------------------------------------
    @GetMapping("/payroll/{teacherId}")
    public ResponseEntity<?> getPayrollData(
            @PathVariable Long teacherId
    ) {
        return ResponseEntity.ok(
                teacherService.getTeacherById(teacherId)
        );
    }
}