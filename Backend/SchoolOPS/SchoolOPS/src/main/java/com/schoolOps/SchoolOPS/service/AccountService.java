package com.schoolOps.SchoolOPS.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.schoolOps.SchoolOPS.dto.AccountResponseDto;
import com.schoolOps.SchoolOPS.entity.Account;
import com.schoolOps.SchoolOPS.entity.Student;
import com.schoolOps.SchoolOPS.entity.Teacher;
import com.schoolOps.SchoolOPS.entity.Transaction;
import com.schoolOps.SchoolOPS.repository.AccountRepository;
import com.schoolOps.SchoolOPS.repository.StudentRepository;
import com.schoolOps.SchoolOPS.repository.TeacherRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AccountService {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final AccountRepository accountRepository;

    // -------------------------------------------------
    // BASIC CRUD
    // -------------------------------------------------

    public Account saveAccount(Account account) {
        log.debug("Saving account");
        return accountRepository.save(account);
    }

    public void deleteAccount(Account account) {
        log.debug("Deleting account | id={}", account.getId());
        accountRepository.delete(account);
    }

    // -------------------------------------------------
    // OPEN ACCOUNTS
    // -------------------------------------------------

    public void openStudentAccount(Student student) {

        Account account = new Account();
        account.setUser(student.getUser());
        account.setStudent(student);
        account.setAccountBalance(0f);

        Account savedAccount = accountRepository.save(account);

        student.setAccount(savedAccount);
        studentRepository.save(student);

        log.info("Student account opened | studentId={}", student.getId());
    }

    public void openTeacherAccount(Teacher teacher) {

        Account account = new Account();
        account.setUser(teacher.getUser());
        account.setAccountBalance(0f);

        Account savedAccount = accountRepository.save(account);

        teacher.setAccount(savedAccount);
        teacherRepository.save(teacher);

        log.info("Teacher account opened | teacherId={}", teacher.getId());
    }

    // -------------------------------------------------
    // FETCH (RETURN DTOs)
    // -------------------------------------------------

    @Transactional
    public List<AccountResponseDto> getAllAccounts() {

        return accountRepository.findAll()
                .stream()
                .map(AccountResponseDto::fromEntity)
                .toList();
    }

    @Transactional
    public AccountResponseDto getAccountById(Long accountId) {

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Account not found with id: " + accountId)
                );

        return AccountResponseDto.fromEntity(account);
    }

    // -------------------------------------------------
    // TRANSACTIONS
    // -------------------------------------------------

    public void makeTransaction(Transaction transaction, Long accountId) {

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Account not found with id: " + accountId)
                );

        List<Transaction> transactions =
                account.getTransactions() != null
                        ? account.getTransactions()
                        : new ArrayList<>();

        transaction.setAccount(account);
        transaction.setTimestamp(LocalDateTime.now());

        // Convert debit to negative
        if ("DEBIT".equalsIgnoreCase(transaction.getType())) {
            transaction.setAmount(-Math.abs(transaction.getAmount()));
        }

        float updatedBalance = account.getAccountBalance() + transaction.getAmount();

        account.setAccountBalance(updatedBalance);
        transaction.setBalance(updatedBalance);

        transactions.add(transaction);
        account.setTransactions(transactions);

        accountRepository.save(account);

        log.info(
                "Transaction completed | accountId={} | type={} | amount={} | newBalance={}",
                accountId,
                transaction.getType(),
                transaction.getAmount(),
                updatedBalance
        );
    }

    // -------------------------------------------------
    // SEARCH (RETURN DTOs)
    // -------------------------------------------------

    @Transactional
    public List<AccountResponseDto> searchAccount(String query) {

        return accountRepository
                .findByStudent_NameContainingIgnoreCase(query)
                .stream()
                .map(AccountResponseDto::fromEntity)
                .toList();
    }
}