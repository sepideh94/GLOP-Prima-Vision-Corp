package com.ciblorgasport.common.exception;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;

import com.ciblorgasport.competition.application.exceptions.CompetitionDateIntegrityException;
import com.ciblorgasport.common.model.Status;
import com.ciblorgasport.event.domain.exception.EventNotFoundException;
import com.ciblorgasport.trial.domain.exception.ResultModificationNotAllowedException;
import com.ciblorgasport.trial.domain.exception.TrialNotCompletedException;
import com.ciblorgasport.trial.domain.exception.TrialNotFoundException;

import jakarta.persistence.EntityNotFoundException;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void shouldHandleResponseStatusException() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/test");
        ResponseStatusException ex = new ResponseStatusException(HttpStatus.BAD_REQUEST, "bad payload");

        var response = handler.handleResponseStatusException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getMessage()).isEqualTo("bad payload");
        assertThat(response.getBody().getPath()).isEqualTo("/api/test");
    }

    @Test
    void shouldHandleValidationException() {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/events");
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "obj");
        bindingResult.addError(new FieldError("obj", "name", "nom requis"));
        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(mock(MethodParameter.class), bindingResult);

        var response = handler.handleValidationException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getValidationErrors()).containsEntry("name", "nom requis");
    }

    @Test
    void shouldHandleDomainExceptions() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/x");

        assertThat(handler.handleEventNotFound(new EventNotFoundException(1L), request).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(handler.handleTrialNotFoundException(new TrialNotFoundException(10L), request).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(handler.handleTrialNotCompletedException(new TrialNotCompletedException(10L, Status.UPCOMING), request).getStatusCode())
                .isEqualTo(HttpStatus.CONFLICT);
        assertThat(handler.handleResultModificationNotAllowed(new ResultModificationNotAllowedException(10L), request).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(handler.handleCompetitionDateIntegrityException(new CompetitionDateIntegrityException("dates"), request).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void shouldHandleSecurityAndGenericExceptions() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/secure");

        ApiError badCreds = handler.handleBadCredentialsException(new BadCredentialsException("bad"));
        assertThat(badCreds.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED.value());
        assertThat(badCreds.getMessage()).contains("incorrect");

        assertThat(handler.handleDisabledException(new DisabledException("disabled"), request).getStatusCode())
                .isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(handler.handleEntityNotFoundException(new EntityNotFoundException("missing"), request).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(handler.handleMaxUploadSizeExceededException(new MaxUploadSizeExceededException(10_000), request).getStatusCode())
                .isEqualTo(HttpStatus.PAYLOAD_TOO_LARGE);
        assertThat(handler.handleIllegalArgumentException(new IllegalArgumentException("bad"), request).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(handler.handleIllegalStateException(new IllegalStateException("state"), request).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(handler.handleGenericException(new RuntimeException("boom"), request).getStatusCode())
                .isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(handler.handleAccessDeniedException(new org.springframework.security.access.AccessDeniedException("denied"), request).getStatusCode())
                .isEqualTo(HttpStatus.FORBIDDEN);
    }
}
