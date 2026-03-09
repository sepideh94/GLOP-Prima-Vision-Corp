package com.ciblorgasport.schedule.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum VolunteerTask {
    ACCUEIL("Accueil"),
    ORIENTATION("Orientation"),
    TRANSPORT("Transport"),
    SUPPORT_MEDICAL("Support médical"),
    SECURITE("Sécurité"),
    LOGISTIQUE("Logistique");

    private final String label;
}