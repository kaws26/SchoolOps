package com.schoolOps.SchoolOPS.dto;

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
    private String studentName;
    private String userName;
    private List<String> transactionIds;
    private float accountBalance;

    public static AccountResponseDto fromEntity(com.schoolOps.SchoolOPS.entity.Account account) {
        if (account == null) return null;
        return new AccountResponseDto(
            account.getId(),
            account.getStudent() != null ? account.getStudent().getName() : null,
            account.getUser() != null ? account.getUser().getName() : null,
            account.getTransactions() != null ? account.getTransactions().stream().map(t -> t.getId().toString()).collect(Collectors.toList()) : List.of(),
            account.getAccountBalance()
        );
    }
}