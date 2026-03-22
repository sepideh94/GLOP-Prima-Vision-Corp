package com.ciblorgasport.common.exception;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;
    private HttpServletRequest request;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
        request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/test");
    }

    @Test
    void handleEntityNotFoundException_Returns404() {
        EntityNotFoundException ex = new EntityNotFoundException("Entity non trouvée");

        ResponseEntity<ApiError> response = exceptionHandler.handleEntityNotFoundException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(404);
        assertThat(response.getBody().getMessage()).isEqualTo("Entity non trouvée");
        assertThat(response.getBody().getPath()).isEqualTo("/api/test");
    }

    @Test
    void handleAccessDeniedException_Returns403() {
        org.springframework.security.access.AccessDeniedException ex = 
                new org.springframework.security.access.AccessDeniedException("Accès refusé");

        ResponseEntity<ApiError> response = exceptionHandler.handleAccessDeniedException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(403);
        assertThat(response.getBody().getMessage()).isEqualTo("Accès refusé");
        assertThat(response.getBody().getPath()).isEqualTo("/api/test");
    }

    @Test
    void handleIllegalArgumentException_Returns400() {
        IllegalArgumentException ex = new IllegalArgumentException("Argument invalide");

        ResponseEntity<ApiError> response = exceptionHandler.handleIllegalArgumentException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(400);
        assertThat(response.getBody().getMessage()).isEqualTo("Argument invalide");
        assertThat(response.getBody().getPath()).isEqualTo("/api/test");
    }

    @Test
    void handleGenericException_Returns500() {
        Exception ex = new Exception("Erreur fatale interne");

        ResponseEntity<ApiError> response = exceptionHandler.handleGenericException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(500);
        assertThat(response.getBody().getMessage()).isEqualTo("Une erreur interne est survenue.");
        assertThat(response.getBody().getPath()).isEqualTo("/api/test");
    }
}
