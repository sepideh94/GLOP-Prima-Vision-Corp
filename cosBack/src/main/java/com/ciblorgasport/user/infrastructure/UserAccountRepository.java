package com.ciblorgasport.user.infrastructure;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.ciblorgasport.admin.Admin;
import com.ciblorgasport.user.domain.UserAccount;
import java.util.List;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long>{
	Optional<UserAccount> findByEmail(String email);

	@Query("SELECT a FROM Admin a")
	List<Admin> findAllAdmins();
}
