package com.ciblorgasport.commissionner;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommissionerRepository extends JpaRepository<Commissionner, Long> {
    Optional<Commissionner> findByEmail(String email);
}