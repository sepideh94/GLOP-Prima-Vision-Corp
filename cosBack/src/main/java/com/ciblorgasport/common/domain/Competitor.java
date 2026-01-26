package com.ciblorgasport.common.domain;

/**
 * Interface polymorphique pour les entités pouvant participer à une compétition.
 * Implémentée par Athlete et potentiellement d'autres types de participants (Team, etc.).
 *
 * Cette interface est placée dans le package common pour permettre une architecture
 * extensible sans créer de dépendances circulaires entre les modules.
 */
public interface Competitor {
    Long getId();
    String getDisplayName();
}
