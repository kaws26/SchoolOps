package com.schoolOps.SchoolOPS.repository;

import com.schoolOps.SchoolOPS.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

}
