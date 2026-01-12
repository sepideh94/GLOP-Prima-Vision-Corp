package com.ciblorgasport.user.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {
	
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private boolean isAccountActive;
}
