package com.ciblorgasport.common.application;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.ciblorgasport.common.dto.CountryResponse;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class CountryService {

	private static final String RESTCOUNTRIES_URL = "https://restcountries.com/v3.1/all?fields=name,cca2,translations";

	private final RestClient restClient;
	private List<CountryResponse> cachedCountries;

	public CountryService() {
		this.restClient = RestClient.create();
	}

	@SuppressWarnings("unchecked")
	public List<CountryResponse> getAllCountries() {
		if (cachedCountries != null) {
			return cachedCountries;
		}

		try {
			List<Map<String, Object>> raw = restClient.get()
					.uri(RESTCOUNTRIES_URL)
					.retrieve()
					.body(new ParameterizedTypeReference<>() {});

			List<CountryResponse> countries = new ArrayList<>();
			if (raw != null) {
				for (Map<String, Object> entry : raw) {
					String code = (String) entry.get("cca2");

					// Nom français via translations.fra.common, sinon fallback sur name.common
					String name = null;
					Map<String, Object> translations = (Map<String, Object>) entry.get("translations");
					if (translations != null) {
						Map<String, Object> fra = (Map<String, Object>) translations.get("fra");
						if (fra != null) {
							name = (String) fra.get("common");
						}
					}
					if (name == null) {
						Map<String, Object> nameObj = (Map<String, Object>) entry.get("name");
						if (nameObj != null) {
							name = (String) nameObj.get("common");
						}
					}

					if (code != null && name != null) {
						countries.add(new CountryResponse(code, name));
					}
				}
			}

			countries.sort(Comparator.comparing(CountryResponse::getName));
			cachedCountries = countries;
			log.info("Loaded {} countries from RestCountries API", countries.size());
			return cachedCountries;

		} catch (Exception e) {
			log.error("Erreur lors de la récupération des pays", e);
			return List.of();
		}
	}
}
