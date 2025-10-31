package com.ciblorgasport.user.infrastructure;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ciblorgasport.user.domain.UserAccount;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long>{
	Optional<UserAccount> findByEmail(String email);
}
