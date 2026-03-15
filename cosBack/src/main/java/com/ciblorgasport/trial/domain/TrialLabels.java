package com.ciblorgasport.trial.domain;

import java.util.Map;

/**
 * Fournit les libellés d'affichage pour les valeurs de {@link TrialName}.
 * Séparé de l'enum pour respecter le principe de responsabilité unique.
 */
public class TrialLabels {

    private static final Map<TrialName, String> LABELS = Map.ofEntries(
        Map.entry(TrialName.FIFTY_M_FREESTYLE,              "50m nage libre"),
        Map.entry(TrialName.HUNDRED_M_FREESTYLE,            "100m nage libre"),
        Map.entry(TrialName.TWO_HUNDRED_M_FREESTYLE,        "200m nage libre"),
        Map.entry(TrialName.FOUR_HUNDRED_M_FREESTYLE,       "400m nage libre"),
        Map.entry(TrialName.FIVE_HUNDRED_M_FREESTYLE,       "500m nage libre"),
        Map.entry(TrialName.EIGHT_HUNDRED_M_FREESTYLE,      "800m nage libre"),
        Map.entry(TrialName.FIFTEEN_HUNDRED_M_FREESTYLE,    "1500m nage libre"),
        Map.entry(TrialName.HUNDRED_M_BACKSTROKE,           "100m dos"),
        Map.entry(TrialName.TWO_HUNDRED_M_BACKSTROKE,       "200m dos"),
        Map.entry(TrialName.HUNDRED_M_BREASTSTROKE,         "100m brasse"),
        Map.entry(TrialName.TWO_HUNDRED_M_BREASTSTROKE,     "200m brasse"),
        Map.entry(TrialName.HUNDRED_M_BUTTERFLY,            "100m papillon"),
        Map.entry(TrialName.TWO_HUNDRED_M_BUTTERFLY,        "200m papillon"),
        Map.entry(TrialName.TWO_HUNDRED_M_INDIVIDUAL_MEDLEY,"200m 4 nages"),
        Map.entry(TrialName.FOUR_HUNDRED_M_INDIVIDUAL_MEDLEY,"400m 4 nages"),
        Map.entry(TrialName.RELAY_4X100M_FREESTYLE,         "Relais 4×100m nage libre"),
        Map.entry(TrialName.RELAY_4X200M_FREESTYLE,         "Relais 4×200m nage libre"),
        Map.entry(TrialName.RELAY_4X100M_MEDLEY,            "Relais 4×100m 4 nages")
    );

    private TrialLabels() {}

    public static String getLabel(TrialName name) {
        return LABELS.getOrDefault(name, name.name());
    }
}
