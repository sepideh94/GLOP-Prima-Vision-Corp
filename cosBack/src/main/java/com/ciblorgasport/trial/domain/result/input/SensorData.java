package com.ciblorgasport.trial.domain.result.input;

import java.math.BigDecimal;

/**
 * Données brutes reçues depuis un capteur (ou sa simulation JSON/endpoint).
 *
 * @param trialParticipantId identifiant du participant dans l'épreuve
 * @param performanceValue   valeur mesurée par le capteur
 */
public record SensorData(Long trialParticipantId, BigDecimal performanceValue) {}
