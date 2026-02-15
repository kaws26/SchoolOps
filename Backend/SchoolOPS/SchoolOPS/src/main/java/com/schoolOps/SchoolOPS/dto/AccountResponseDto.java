package com.schoolOps.SchoolOPS.dto;

import com.schoolOps.SchoolOPS.entity.Account;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountResponseDto {

    private Long id;

    // Student Info
    private Long studentId;
    private String studentName;

    // User Info
    private Long userId;
    private String userName;

    // Account Info
    private float accountBalance;
    private int totalTransactions;

    // Full Transaction Details
    private List<TransactionResponseDto> transactions;

    public static AccountResponseDto fromEntity(Account account) {
        if (account == null) return null;

        List<TransactionResponseDto> transactionDtos =
                account.getTransactions() != null
                        ? account.getTransactions()
                        .stream()
                        .map(TransactionResponseDto::fromEntity)
                        .collect(Collectors.toList())
                        : List.of();

        return new AccountResponseDto(
                account.getId(),
                account.getStudent() != null ? account.getStudent().getId() : null,
                account.getStudent() != null ? account.getStudent().getName() : null,
                account.getUser() != null ? account.getUser().getId() : null,
                account.getUser() != null ? account.getUser().getName() : null,
                account.getAccountBalance(),
                transactionDtos.size(),
                transactionDtos
        );
    }
}