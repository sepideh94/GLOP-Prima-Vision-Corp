package com.ciblorgasport.security.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwtAuthenticationResponse {
  String token;
  String role;
  Long userId;
  /** Prénom du compte (affichage accueil, etc.) */
  String firstName;
  /** Nom du compte */
  String lastName;
}
