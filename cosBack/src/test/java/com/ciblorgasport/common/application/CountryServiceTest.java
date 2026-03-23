package com.ciblorgasport.common.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.mockito.Answers;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestClient;

import com.ciblorgasport.common.dto.CountryResponse;

class CountryServiceTest {

    @Test
    void shouldReturnCachedCountriesWithoutCallingApi() {
        CountryService service = new CountryService();
        @SuppressWarnings("unchecked")
        List<CountryResponse> cached = List.of(new CountryResponse("FR", "France"));
        RestClient restClient = org.mockito.Mockito.mock(RestClient.class);
        ReflectionTestUtils.setField(service, "restClient", restClient);
        ReflectionTestUtils.setField(service, "cachedCountries", cached);

        List<CountryResponse> result = service.getAllCountries();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("France");
        verifyNoInteractions(restClient);
    }

    @Test
    void shouldLoadCountriesFromApiAndSortThem() {
        CountryService service = new CountryService();
        RestClient restClient = org.mockito.Mockito.mock(RestClient.class, Answers.RETURNS_DEEP_STUBS);
        ReflectionTestUtils.setField(service, "restClient", restClient);

        List<Map<String, Object>> raw = List.of(
                Map.of(
                        "cca2", "FR",
                        "translations", Map.of("fra", Map.of("common", "France"))
                ),
                Map.of(
                        "cca2", "DE",
                        "name", Map.of("common", "Germany")
                ),
                Map.of("name", Map.of("common", "NoCode"))
        );
        when(restClient.get().uri(anyString()).retrieve().body(any(org.springframework.core.ParameterizedTypeReference.class)))
                .thenReturn(raw);

        List<CountryResponse> result = service.getAllCountries();

        assertThat(result).extracting(CountryResponse::getCode).containsExactly("FR", "DE");
        assertThat(result).extracting(CountryResponse::getName).containsExactly("France", "Germany");
    }

    @Test
    void shouldReturnEmptyListOnApiFailure() {
        CountryService service = new CountryService();
        RestClient restClient = org.mockito.Mockito.mock(RestClient.class, Answers.RETURNS_DEEP_STUBS);
        ReflectionTestUtils.setField(service, "restClient", restClient);
        when(restClient.get().uri(anyString()).retrieve().body(any(org.springframework.core.ParameterizedTypeReference.class)))
                .thenThrow(new RuntimeException("down"));

        List<CountryResponse> result = service.getAllCountries();

        assertThat(result).isEmpty();
    }
}
