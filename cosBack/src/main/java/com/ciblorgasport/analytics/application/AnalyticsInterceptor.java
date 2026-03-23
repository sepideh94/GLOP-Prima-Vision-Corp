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
        // Sections transverses
        if (uri.startsWith("/api/notifications")) return "Notifications";
        if (uri.startsWith("/api/schedule")) return "Calendrier";
        if (uri.startsWith("/api/event")) return "Evenements";
        if (uri.startsWith("/api/competition")) return "Competitions";
        if (uri.startsWith("/api/trials") || uri.startsWith("/api/trial")) return "Epreuves";
        if (uri.startsWith("/api/map") || uri.startsWith("/api/fan-zones")) return "Carte";
        if (uri.startsWith("/api/incident")) return "Incidents";

        // Athlete : sous-sections detaillees
        if (uri.startsWith("/api/athlete/profile")) return "Profil Athlete";
        if (uri.startsWith("/api/athlete/competitions")) return "Competitions Athlete";
        if (uri.startsWith("/api/athlete/results")) return "Resultats Athlete";
        if (uri.startsWith("/api/athlete")) return "Espace Athlete";

        // Commissaire : sous-sections detaillees
        if (uri.startsWith("/api/commissioner/participations")) return "Validation Dossiers";
        if (uri.startsWith("/api/commissioner/trials")) return "Gestion Epreuves";
        if (uri.startsWith("/api/commissioner/athletes")) return "Gestion Athletes";
        if (uri.startsWith("/api/commissioner/competitions")) return "Gestion Competitions";
        if (uri.startsWith("/api/commissioner")) return "Espace Commissaire";

        // Admin : sous-sections detaillees (evite le bloc unique Espace Admin)
        if (uri.startsWith("/api/admin/stats")) return "Statistiques";
        if (uri.startsWith("/api/admin/users")) return "Gestion Utilisateurs";
        if (uri.startsWith("/api/admin/commissioners")) return "Accreditations Commissaires";
        if (uri.startsWith("/api/admin/competitions")) return "Gestion Volontaires";
        if (uri.startsWith("/api/admin/events")) return "Gestion Volontaires";
        if (uri.startsWith("/api/admin/report")) return "Reporting";
        if (uri.startsWith("/api/admin")) return "Espace Admin";

        if (uri.startsWith("/api/volonteer")) return "Espace Volontaire";
        if (uri.startsWith("/api/team")) return "Espace Equipe";
        if (uri.startsWith("/api/site")) return "Sites";
        if (uri.startsWith("/api/countries")) return "Parametrage Pays";
        if (uri.startsWith("/api/stats")) return "Statistiques";

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
