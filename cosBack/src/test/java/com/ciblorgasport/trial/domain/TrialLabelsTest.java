package com.ciblorgasport.trial.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class TrialLabelsTest {

    @Test
    void shouldReturnFrenchLabelWhenKnown() {
        assertThat(TrialLabels.getLabel(TrialName.FIFTY_M_FREESTYLE)).isEqualTo("50m nage libre");
        assertThat(TrialLabels.getLabel(TrialName.RELAY_4X100M_MEDLEY)).contains("Relais");
    }

    @Test
    void shouldThrowWhenNameIsNull() {
        assertThatThrownBy(() -> TrialLabels.getLabel(null))
                .isInstanceOf(NullPointerException.class);
    }
}
