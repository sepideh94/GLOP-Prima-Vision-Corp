package com.ciblorgasport.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCommissionnerRequest {
    private String firstName;
    private String lastName;
    private String email;
}
