package com.ciblorgasport.common.crypto;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class StringEncryptConverterTest {

    private StringEncryptConverter converter;

    @BeforeEach
    void setUp() {
        converter = new StringEncryptConverter();
        // 128-bit key in hex (16 bytes)
        ReflectionTestUtils.setField(converter, "secretKey", "00112233445566778899aabbccddeeff");
    }

    @Test
    void shouldEncryptAndDecryptRoundTrip() {
        String encrypted = converter.convertToDatabaseColumn("secret-value");
        assertThat(encrypted).isNotBlank();
        assertThat(encrypted).isNotEqualTo("secret-value");

        String decrypted = converter.convertToEntityAttribute(encrypted);
        assertThat(decrypted).isEqualTo("secret-value");
    }

    @Test
    void shouldHandleNullsAndInvalidPayload() {
        assertThat(converter.convertToDatabaseColumn(null)).isNull();
        assertThat(converter.convertToEntityAttribute(null)).isNull();
        assertThatThrownBy(() -> converter.convertToEntityAttribute("invalid-base64"))
                .isInstanceOf(RuntimeException.class);
    }
}
