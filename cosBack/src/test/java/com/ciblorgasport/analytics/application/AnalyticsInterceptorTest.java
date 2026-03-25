package com.ciblorgasport.analytics.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import com.ciblorgasport.analytics.domain.PageVisit;
import com.ciblorgasport.analytics.infrastructure.PageVisitRepository;

class AnalyticsInterceptorTest {

    private final PageVisitRepository pageVisitRepository = org.mockito.Mockito.mock(PageVisitRepository.class);
    private final AnalyticsInterceptor interceptor = new AnalyticsInterceptor(pageVisitRepository);

    @AfterEach
    void cleanupSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldSaveVisitForAuthenticatedGetRequest() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "user@test.com",
                        "pwd",
                        java.util.List.of(new SimpleGrantedAuthority("ROLE_ADMIN")))
        );
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/admin/stats");
        MockHttpServletResponse response = new MockHttpServletResponse();
        response.setStatus(200);

        interceptor.afterCompletion(request, response, new Object(), null);

        ArgumentCaptor<PageVisit> captor = ArgumentCaptor.forClass(PageVisit.class);
        verify(pageVisitRepository).save(captor.capture());
        assertThat(captor.getValue().getSection()).isEqualTo("Statistiques");
        assertThat(captor.getValue().getUserRole()).isEqualTo("ADMIN");
        assertThat(captor.getValue().getTimestamp()).isNotNull();
    }

    @Test
    void shouldNotSaveVisitForUnknownSectionOrAnonymous() {
        MockHttpServletRequest unknown = new MockHttpServletRequest("GET", "/api/unknown");
        MockHttpServletResponse ok = new MockHttpServletResponse();
        ok.setStatus(200);
        interceptor.afterCompletion(unknown, ok, new Object(), null);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("anonymousUser", "n/a")
        );
        MockHttpServletRequest known = new MockHttpServletRequest("GET", "/api/notifications");
        interceptor.afterCompletion(known, ok, new Object(), null);

        verify(pageVisitRepository, never()).save(any(PageVisit.class));
    }

    @Test
    void shouldIgnoreNonGetOrErrorResponses() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "user@test.com",
                        "pwd",
                        java.util.List.of(new SimpleGrantedAuthority("ROLE_ATHLETE")))
        );

        MockHttpServletRequest post = new MockHttpServletRequest("POST", "/api/notifications");
        MockHttpServletResponse ok = new MockHttpServletResponse();
        ok.setStatus(200);
        interceptor.afterCompletion(post, ok, new Object(), null);

        MockHttpServletRequest get = new MockHttpServletRequest("GET", "/api/notifications");
        MockHttpServletResponse bad = new MockHttpServletResponse();
        bad.setStatus(500);
        interceptor.afterCompletion(get, bad, new Object(), null);

        verify(pageVisitRepository, never()).save(any(PageVisit.class));
    }
}
