package com.schoolOps.SchoolOPS.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponseDto {
    private Long id;
    private String accountId;
    private String type;
    private String remarks;
    private LocalDateTime timestamp;
    private String mode;
    private float balance;
    private float amount;

    public static TransactionResponseDto fromEntity(com.schoolOps.SchoolOPS.entity.Transaction transaction) {
        if (transaction == null) return null;
        return new TransactionResponseDto(
            transaction.getId(),
            transaction.getAccount() != null ? transaction.getAccount().getId().toString() : null,
            transaction.getType(),
            transaction.getRemarks(),
            transaction.getTimestamp(),
            transaction.getMode(),
            transaction.getBalance(),
            transaction.getAmount()
        );
    }
}