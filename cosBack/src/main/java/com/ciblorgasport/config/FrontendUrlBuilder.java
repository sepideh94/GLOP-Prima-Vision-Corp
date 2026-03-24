package com.ciblorgasport.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Construit les URLs du frontend SPA. En production (Docker), le build Vite utilise souvent
 * {@code HashRouter} : les liens doivent être {@code https://domaine/#/login?...} et non
 * {@code https://domaine/login?...}.
 */
@Component
public class FrontendUrlBuilder {

    /** Défini dans {@code application.properties} ({@code app.base-url} / {@code APP_BASE_URL}). */
    @Value("${app.base-url}")
    private String appBaseUrl;

    @Value("${app.frontend.use-hash-router:false}")
    private boolean useHashRouter;

    public String baseNoTrailingSlash() {
        if (appBaseUrl == null || appBaseUrl.isBlank()) {
            return "http://localhost:3000";
        }
        return appBaseUrl.replaceAll("/$", "");
    }

    /**
     * @param pathWithQuery chemin commençant par /, ex. {@code /login?activated=true}
     */
    public String path(String pathWithQuery) {
        String p = pathWithQuery == null || pathWithQuery.isEmpty() ? "/" : pathWithQuery;
        if (!p.startsWith("/")) {
            p = "/" + p;
        }
        if (useHashRouter) {
            return baseNoTrailingSlash() + "/#" + p;
        }
        return baseNoTrailingSlash() + p;
    }

    public boolean isUseHashRouter() {
        return useHashRouter;
    }
}
