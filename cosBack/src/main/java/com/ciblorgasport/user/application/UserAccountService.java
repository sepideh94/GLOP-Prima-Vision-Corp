package com.ciblorgasport.user.application;

import org.springframework.stereotype.Service;

import com.ciblorgasport.user.infrastructure.UserAccountRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserAccountService {
	
	private final UserAccountRepository userRepo;
	
	

}
