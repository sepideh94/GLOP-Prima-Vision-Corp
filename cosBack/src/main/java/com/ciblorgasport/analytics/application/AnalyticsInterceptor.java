package com.ciblorgasport.analytics.application;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import com.ciblorgasport.analytics.domain.PageVisit;
import com.ciblorgasport.analytics.infrastructure.PageVisitRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AnalyticsInterceptor implements HandlerInterceptor {

    private final PageVisitRepository pageVisitRepository;

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        if (!"GET".equalsIgnoreCase(request.getMethod()) || response.getStatus() >= 400) {
            return;
        }

        String requestUri = request.getRequestURI();
        String section = mapUriToSection(requestUri);

        if (section == null) {
            return;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return;
        }

        String role = extractPrimaryRole(authentication);

        PageVisit visit = PageVisit.builder()
                .section(section)
                .userRole(role)
                .timestamp(LocalDateTime.now())
                .build();

        pageVisitRepository.save(visit);
    }

    private String mapUriToSection(String uri) {
        if (uri.startsWith("/api/athlete/competitions") || uri.startsWith("/api/competition")) {
            return "Competitions";
        } else if (uri.startsWith("/api/schedule")) {
            return "Calendrier";
        } else if (uri.startsWith("/api/athlete/profile")) {
            return "Profil_Athlete";
        } else if (uri.startsWith("/api/commissioner/trials")) {
            return "Gestion_Epreuves";
        } else if (uri.startsWith("/api/commissioner/participations")) {
            return "Validation_Dossiers";
        } else if (uri.startsWith("/api/admin")) {
            return "Espace_Admin";
        } else if (uri.startsWith("/api/volonteer")) {
            return "Espace_Volontaire";
        } else if (uri.startsWith("/api/athlete")) {
            return "Espace_Athlete";
        } else if (uri.startsWith("/api/team")) {
            return "Espace_Equipe";
        } else if (uri.startsWith("/api/stats") || uri.startsWith("/api/admin/stats")) {
            return "Statistiques";
        }
        return null;
    }

    private String extractPrimaryRole(Authentication authentication) {
        Optional<? extends GrantedAuthority> firstAuth = authentication.getAuthorities().stream().findFirst();
        if (firstAuth.isPresent()) {
            String role = firstAuth.get().getAuthority();
            return role.startsWith("ROLE_") ? role.substring(5) : role;
        }
        return "UNKNOWN";
    }
}
