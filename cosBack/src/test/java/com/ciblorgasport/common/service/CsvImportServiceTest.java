package com.ciblorgasport.common.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

class CsvImportServiceTest {

    private final CsvImportService service = new CsvImportService();

    @Test
    void shouldParseCommaSeparatedCsv() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "users.csv",
                "text/csv",
                "firstName,lastName\nAda,Lovelace\n".getBytes()
        );

        var records = service.parseCsv(file);

        assertThat(records).hasSize(1);
        assertThat(records.get(0).get("firstName")).isEqualTo("Ada");
    }

    @Test
    void shouldParseSemicolonSeparatedCsv() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "users.csv",
                "application/vnd.ms-excel",
                "firstName;lastName\nAlan;Turing\n".getBytes()
        );

        var records = service.parseCsv(file);

        assertThat(records).hasSize(1);
        assertThat(records.get(0).get("lastName")).isEqualTo("Turing");
    }

    @Test
    void shouldRejectTooLargeFile() {
        byte[] content = new byte[6 * 1024 * 1024];
        MockMultipartFile file = new MockMultipartFile("file", "big.csv", "text/csv", content);

        assertThatThrownBy(() -> service.parseCsv(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("5 Mo");
    }
}
