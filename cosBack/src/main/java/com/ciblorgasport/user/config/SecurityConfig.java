package com.ciblorgasport.user.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.ciblorgasport.user.application.UserAccountService;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

	private final JwtAuthenticationFilter jwtAuthFilter;
	private final UserAccountService userService;
	private final PasswordEncoder pwdEncoder;
	
	@Bean
	public AuthenticationProvider authenticationProvider() {
		DaoAuthenticationProvider authProvider= new DaoAuthenticationProvider(userService.userDetailsService());
		authProvider.setPasswordEncoder(pwdEncoder);
		return authProvider;
	}
	
	
	@Bean 
	public AuthenticationManager authentificationManager(AuthenticationConfiguration config)throws Exception{
		return config.getAuthenticationManager();
	}
	
	@Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				.csrf(csrf -> csrf.disable())
				.sessionManagement(session -> session
						.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
						)
				.authorizeHttpRequests(authorize -> authorize
						.requestMatchers(HttpMethod.POST,"/api/auth/login").permitAll()
					    .requestMatchers("/api/admin/**").hasRole("ADMIN")
					    .requestMatchers("/api/commissaire/**").hasRole("COMMISSAIRE")
					    .requestMatchers("/api/athlete/**").hasRole("ATHLETE")
					    .requestMatchers("/api/volontaire/**").hasRole("VOLONTAIRE")
					    .requestMatchers("/api/spectateur/**").hasRole("SPECTATEUR")
					    .anyRequest().authenticated()
						)
				.authenticationProvider(authenticationProvider())
				.addFilterBefore(jwtAuthFilter,UsernamePasswordAuthenticationFilter.class)
				;
		 return http.build();		
				
	}
}
