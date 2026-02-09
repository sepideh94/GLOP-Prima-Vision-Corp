package com.ciblorgasport.athlete.api;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ciblorgasport.athlete.application.AthleteService;
import com.ciblorgasport.athlete.dto.AthleteProfileUpdateRequest;
import com.ciblorgasport.athlete.dto.AthleteResponse;
import com.ciblorgasport.user.domain.UserAccount;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/athlete/profile")
@RequiredArgsConstructor
public class AthleteProfileController {

	private final AthleteService athleteService;

	@GetMapping
	public ResponseEntity<AthleteResponse> getMyProfile(@AuthenticationPrincipal UserAccount user) {
		return ResponseEntity.ok(athleteService.getAthleteProfile(user.getId()));
	}

	@PutMapping
	public ResponseEntity<AthleteResponse> updateMyProfile(
			@AuthenticationPrincipal UserAccount user,
			@Valid @RequestBody AthleteProfileUpdateRequest request) {
		return ResponseEntity.ok(athleteService.updateAthleteProfile(user.getId(), request));
	}

	@PostMapping("/medical-certificate")
	public ResponseEntity<Void> uploadMedicalCertificate(
			@AuthenticationPrincipal UserAccount user,
			@RequestParam("file") MultipartFile file) {
		athleteService.uploadMedicalCertificate(user.getId(), file);
		return ResponseEntity.ok().build();
	}

	@GetMapping("/medical-certificate")
	public ResponseEntity<byte[]> downloadMedicalCertificate(@AuthenticationPrincipal UserAccount user) {
		byte[] data = athleteService.downloadMedicalCertificate(user.getId());
		String contentType = athleteService.getMedicalCertificateContentType(user.getId());

		return ResponseEntity.ok()
				.contentType(MediaType.parseMediaType(contentType))
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"medical-certificate\"")
				.body(data);
	}

	@DeleteMapping("/medical-certificate")
	public ResponseEntity<Void> deleteMedicalCertificate(@AuthenticationPrincipal UserAccount user) {
		athleteService.deleteMedicalCertificate(user.getId());
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/passport")
	public ResponseEntity<Void> uploadPassport(
			@AuthenticationPrincipal UserAccount user,
			@RequestParam("file") MultipartFile file) {
		athleteService.uploadPassport(user.getId(), file);
		return ResponseEntity.ok().build();
	}

	@GetMapping("/passport")
	public ResponseEntity<byte[]> downloadPassport(@AuthenticationPrincipal UserAccount user) {
		byte[] data = athleteService.downloadPassport(user.getId());
		String contentType = athleteService.getPassportContentType(user.getId());

		return ResponseEntity.ok()
				.contentType(MediaType.parseMediaType(contentType))
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"passport\"")
				.body(data);
	}

	@DeleteMapping("/passport")
	public ResponseEntity<Void> deletePassport(@AuthenticationPrincipal UserAccount user) {
		athleteService.deletePassport(user.getId());
		return ResponseEntity.noContent().build();
	}
}
