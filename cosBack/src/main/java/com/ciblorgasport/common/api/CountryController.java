package com.ciblorgasport.common.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ciblorgasport.common.application.CountryService;
import com.ciblorgasport.common.dto.CountryResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/countries")
@RequiredArgsConstructor
public class CountryController {

	private final CountryService countryService;

	@GetMapping
	public ResponseEntity<List<CountryResponse>> getAllCountries() {
		return ResponseEntity.ok(countryService.getAllCountries());
	}
}
