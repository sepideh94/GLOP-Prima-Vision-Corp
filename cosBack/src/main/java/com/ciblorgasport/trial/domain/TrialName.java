package com.ciblorgasport.trial.domain;

public enum TrialName {
    FIFTY_M_FREESTYLE("50m nage libre"),
    HUNDRED_M_FREESTYLE("100m nage libre"),
    TWO_HUNDRED_M_FREESTYLE("200m nage libre"),
    FOUR_HUNDRED_M_FREESTYLE("400m nage libre"),
    FIVE_HUNDRED_M_FREESTYLE("500m nage libre"),
    EIGHT_HUNDRED_M_FREESTYLE("800m nage libre"),
    FIFTEEN_HUNDRED_M_FREESTYLE("1500m nage libre"),
    HUNDRED_M_BACKSTROKE("100m dos"),
    TWO_HUNDRED_M_BACKSTROKE("200m dos"),
    HUNDRED_M_BREASTSTROKE("100m brasse"),
    TWO_HUNDRED_M_BREASTSTROKE("200m brasse"),
    HUNDRED_M_BUTTERFLY("100m papillon"),
    TWO_HUNDRED_M_BUTTERFLY("200m papillon"),
    TWO_HUNDRED_M_INDIVIDUAL_MEDLEY("200m 4 nages"),
    FOUR_HUNDRED_M_INDIVIDUAL_MEDLEY("400m 4 nages"),
    RELAY_4X100M_FREESTYLE("Relais 4*100m nage libre"),
    RELAY_4X200M_FREESTYLE("Relais 4*200m nage libre"),
    RELAY_4X100M_MEDLEY("Relais 4*100m 4 nages");

    private final String displayName;

    TrialName(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
