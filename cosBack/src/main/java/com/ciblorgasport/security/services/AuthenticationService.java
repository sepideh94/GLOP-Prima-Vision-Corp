package com.ciblorgasport.security.services;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ciblorgasport.user.application.UserAccountService;
import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
	
	private final UserAccountRepository userRepository;
	private final UserAccountService userService;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;
	private final AuthenticationManager authenticationManager;
	
	
	 public JwtAuthenticationResponse signup(SignUpRequest request) {
	      var user = UserAccount
	                  .builder()
	                  .firstName(request.getFirstName())
	                  .lastName(request.getLastName())
	                  .email(request.getEmail())
	                  .password(passwordEncoder.encode(request.getPassword()))
	                  .role(Role.ROLE_USER)
	                  .build();

	      user = userService.save(user);
	      var jwt = jwtService.generateToken(user);
	      return JwtAuthenticationResponse.builder().token(jwt).build();
	  }


	  public JwtAuthenticationResponse signin(SignInRequest request) {
	      authenticationManager.authenticate(
	              new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
	      var user = userRepository.findByEmail(request.getEmail())
	              .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));
	      var jwt = jwtService.generateToken(user);
	      return JwtAuthenticationResponse.builder().token(jwt).build();
	  }
}
