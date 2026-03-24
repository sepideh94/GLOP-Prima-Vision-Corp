package com.ciblorgasport.geolocation.util;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;

class EncodedPolylineDecoderTest {

    @Test
    void shouldReturnEmptyListForNullOrEmptyInput() {
        assertThat(EncodedPolylineDecoder.decode(null)).isEmpty();
        assertThat(EncodedPolylineDecoder.decode("")).isEmpty();
    }

    @Test
    void shouldDecodeGoogleSamplePolyline() {
        String encoded = "_p~iF~ps|U_ulLnnqC_mqNvxq`@";

        List<double[]> decoded = EncodedPolylineDecoder.decode(encoded);

        assertThat(decoded).hasSize(3);
        assertThat(decoded.get(0)).containsExactly(38.5, -120.2);
        assertThat(decoded.get(1)).containsExactly(40.7, -120.95);
        assertThat(decoded.get(2)).containsExactly(43.252, -126.453);
    }
}
