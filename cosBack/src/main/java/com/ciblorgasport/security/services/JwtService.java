package com.ciblorgasport.security.services;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;



/**
 * Service gérant la création, la validation et l’extraction des informations
 * contenues dans les tokens JWT (JSON Web Token).
 *
 * <p>Cette classe est utilisée pour générer un token à partir des informations d’un utilisateur,
 * vérifier si un token est valide et extraire les données qu’il contient (comme le nom d’utilisateur).</p>
 *
 * <p>Les valeurs de la clé secrète et de la durée d’expiration du token sont définies
 * dans le fichier de configuration (ex: application.properties) :</p>
 *
 * <pre>
 * token.secret.key = clé_secrète_base64
 * token.expirationms = durée_en_millisecondes
 * </pre>
 
 */
@Service
public class JwtService {
		
	@Value("${token.secret.key}")
	String jwtSecretKey;
	
	@Value("${token.expirationms}")
	Long jwtExpirationsMs;
	
	
	/**
     * Extrait le nom d’utilisateur du token JWT.
     *
     * @param token le token JWT
     * @return le nom d’utilisateur contenu dans le token
     */
	public String extractUserName(String token) {
		
		return extractClaim(token, Claims::getSubject);
	}
	
	
	 /**
     * Génère un token JWT à partir des informations d’un utilisateur.
     *
     * @param userDetails les informations de l’utilisateur 
     * @return le token JWT généré
     */
	public String generateToken(UserDetails userDetails) {
		
		return generateToken(new HashMap<>(), userDetails);
	}
	
	 /**
     * Vérifie si un token JWT est valide pour un utilisateur donné.
     * @param token le token JWT à vérifier
     * @param userDetails les informations de l’utilisateur
     * @return {@code true} si le token est valide, {@code false} sinon
     */
	public boolean isTokenValid(String token, UserDetails userDetails) {
		final String userName= extractUserName(token);
		return (userName.equals(userDetails.getUsername())) && !isTokenExpired(token);
	}
	
	
	 /**
     * Extrait une information (claim) spécifique d’un token JWT.
     *
     * @param <T> le type de donnée à extraire
     * @param token le token JWT
     * @param claimsResolver une fonction qui indique quelle propriété extraire
     * @return la valeur extraite
     */
	private <T> T extractClaim(String token, Function<Claims, T> claimsResolvers) {
	      final Claims claims = extractAllClaims(token);
	      return claimsResolvers.apply(claims);
	}
	 
	/**
     * Génère un token JWT avec des informations supplémentaires (claims).
     *
     * @param extraClaims les données supplémentaires à inclure dans le token
     * @param userDetails les informations de l’utilisateur
     * @return le token JWT généré
     */
	private String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
	      return Jwts
	        .builder()
	        .setClaims(extraClaims)
	        .setSubject(userDetails.getUsername())
	        .setIssuedAt(new Date(System.currentTimeMillis()))
	        .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationsMs))
	        .signWith(getSigningKey(), SignatureAlgorithm.HS256)
	        .compact();
	 }
	 
	
	/**
     * Vérifie si le token est expiré.
     *
     * @param token le token JWT
     * @return {@code true} si le token est expiré, {@code false} sinon
     */
	 private boolean isTokenExpired(String token) {
	      return extractExpiration(token).before(new Date());
	 }
	 
	 
	 /**
     * Extrait la date d’expiration du token JWT.
     *
     * @param token le token JWT
     * @return la date d’expiration
     */
	 private Date extractExpiration(String token) {
	      return extractClaim(token, Claims::getExpiration);
	 }
	 
	 
	 /**
     * Extrait tous les claims (informations) contenus dans un token JWT.
     *
     * @param token le token JWT
     * @return les claims extraits
     */
	 private Claims extractAllClaims(String token) {
	      return Jwts
	        .parserBuilder()
	        .setSigningKey(getSigningKey())
	        .build()
	        .parseClaimsJws(token)
	        .getBody();
	  }
	 
	 
	 /**
     * Génère la clé utilisée pour signer et vérifier les tokens JWT,
     * à partir de la clé secrète Base64 définie dans le fichier de configuration.
     *
     * @return la clé HMAC utilisée pour la signature
     */
	 private Key getSigningKey() {
	      byte[] keyBytes = Decoders.BASE64.decode(jwtSecretKey);
	      return Keys.hmacShaKeyFor(keyBytes);
	  }
	 
	 
}
