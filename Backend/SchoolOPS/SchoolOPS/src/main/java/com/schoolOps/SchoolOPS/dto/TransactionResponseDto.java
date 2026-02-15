package com.schoolOps.SchoolOPS.dto;

import com.schoolOps.SchoolOPS.entity.Transaction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponseDto {

    private Long id;
    private String type;
    private float amount;
    private float balanceAfterTransaction;
    private String mode;
    private String remarks;
    private LocalDateTime timestamp;

    public static TransactionResponseDto fromEntity(Transaction transaction) {
        if (transaction == null) return null;

        return new TransactionResponseDto(
                transaction.getId(),
                transaction.getType(),
                transaction.getAmount(),
                transaction.getBalance(),
                transaction.getMode(),
                transaction.getRemarks(),
                transaction.getTimestamp()
        );
    }
}