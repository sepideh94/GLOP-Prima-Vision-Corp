package com.ciblorgasport.trial.round.domain;

public enum RoundName {
    QUALIFICATION_HEAT("Qualification/Heat", 1),
    HUITIEMES_DE_FINALE("Huitièmes de finale", 2),
    QUART_DE_FINALE("Quart de finale", 3),
    DEMI_FINALE("Demi-finale", 4),
    FINALE("Finale", 5),
    PHASE_SUPPLEMENTAIRE("Phase supplémentaire", 6);

    private final String displayName;
    private final int order;

    RoundName(String displayName, int order) {
        this.displayName = displayName;
        this.order = order;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int getOrder() {
        return order;
    }
}
