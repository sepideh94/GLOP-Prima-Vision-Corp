package com.ciblorgasport.athlete.application;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.athlete.dto.AthleteProfileUpdateRequest;
import com.ciblorgasport.athlete.dto.AthleteResponse;
import com.ciblorgasport.athlete.infrastructure.AthleteRepository;
import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.competition.infrastructure.ParticipationRepository;
import com.ciblorgasport.storage.application.StorageService;
import com.ciblorgasport.storage.domain.Document;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AthleteService {

    private final AthleteRepository athleteRepository;
    private final ParticipationRepository participationRepository;
    private final StorageService storageService;

    @Transactional
    public List<AthleteResponse> getAllAthletes() {
        return athleteRepository.findAllByOrderByLastNameAsc().stream()
                .map(AthleteResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<AthleteResponse> getAthletesByCompetition(Long competitionId) {
        List<Long> athleteIds;
        try {
            List<com.ciblorgasport.competition.domain.Participation> participations = participationRepository.findByCompetition_Id(competitionId);
            // #region agent log (stdout for docker logs)
            System.err.println("[DEBUG] {\"location\":\"AthleteService.getAthletesByCompetition:afterFindByCompetitionId\",\"message\":\"participations size\",\"data\":{\"size\":\"" + participations.size() + "\"},\"timestamp\":" + System.currentTimeMillis() + "}");
            // #endregion
            athleteIds = participations.stream()
                    .filter(p -> p.getCompetitorType() == CompetitorType.ATHLETE)
                    .map(p -> p.getCompetitorId())
                    .distinct()
                    .toList();
        } catch (Throwable t) {
            // #region agent log (stdout for docker logs)
            String m = (t.getMessage() != null ? t.getMessage().replace("\"", "'").replace("\n", " ") : "null");
            System.err.println("[DEBUG] {\"location\":\"AthleteService.getAthletesByCompetition:findByCompetitionId\",\"message\":\"exception\",\"data\":{\"exceptionClass\":\"" + t.getClass().getName() + "\",\"message\":\"" + m + "\"},\"timestamp\":" + System.currentTimeMillis() + "}");
            // #endregion
            throw t;
        }
        // #region agent log (stdout for docker logs)
        System.err.println("[DEBUG] {\"location\":\"AthleteService.getAthletesByCompetition:athleteIds\",\"message\":\"athleteIds size\",\"data\":{\"size\":\"" + athleteIds.size() + "\"},\"timestamp\":" + System.currentTimeMillis() + "}");
        // #endregion
        try {
            List<AthleteResponse> result = athleteRepository.findAllById(athleteIds).stream()
                    .map(AthleteResponse::fromEntity)
                    .sorted((a, b) -> a.getLastName().compareToIgnoreCase(b.getLastName()))
                    .collect(Collectors.toList());
            return result;
        } catch (Throwable t) {
            // #region agent log (stdout for docker logs)
            String m = (t.getMessage() != null ? t.getMessage().replace("\"", "'").replace("\n", " ") : "null");
            System.err.println("[DEBUG] {\"location\":\"AthleteService.getAthletesByCompetition:stream\",\"message\":\"exception\",\"data\":{\"exceptionClass\":\"" + t.getClass().getName() + "\",\"message\":\"" + m + "\"},\"timestamp\":" + System.currentTimeMillis() + "}");
            // #endregion
            throw t;
        }
    }

    @Transactional
    public AthleteResponse getAthleteProfile(Long athleteId) {
        Athlete athlete = athleteRepository.findById(athleteId)
                .orElseThrow(() -> new EntityNotFoundException("Athlète introuvable"));
        return AthleteResponse.fromEntity(athlete);
    }

    @Transactional
    public AthleteResponse updateAthleteProfile(Long athleteId, AthleteProfileUpdateRequest request) {
        Athlete athlete = athleteRepository.findById(athleteId)
                .orElseThrow(() -> new EntityNotFoundException("Athlète introuvable"));

        if (request.getNationality() != null) athlete.setNationality(request.getNationality());
        if (request.getBirthDate() != null) athlete.setBirthDate(request.getBirthDate());
        if (request.getSexe() != null) athlete.setSexe(request.getSexe());
        if (request.getPassportNumber() != null) athlete.setPassportNumber(request.getPassportNumber());
        if (request.getHasAcceptedCharte() != null) athlete.setHasAcceptedCharte(request.getHasAcceptedCharte());

        Athlete saved = athleteRepository.save(athlete);
        return AthleteResponse.fromEntity(saved);
    }

    @Transactional
    public void uploadMedicalCertificate(Long athleteId, MultipartFile file) {
        Athlete athlete = athleteRepository.findById(athleteId)
                .orElseThrow(() -> new EntityNotFoundException("Athlète introuvable"));

        if (athlete.getMedicalCertificate() != null) {
            storageService.deleteFile(athlete.getMedicalCertificate());
        }

        String keyPrefix = "athletes/" + athleteId + "/medical-certificate";
        Document document = storageService.uploadFile(keyPrefix, file);

        athlete.setMedicalCertificate(document);
        athleteRepository.save(athlete);
    }

    public byte[] downloadMedicalCertificate(Long athleteId) {
        Athlete athlete = athleteRepository.findById(athleteId)
                .orElseThrow(() -> new EntityNotFoundException("Athlète introuvable"));

        if (athlete.getMedicalCertificate() == null) {
            throw new EntityNotFoundException("Aucun certificat médical trouvé");
        }

        return storageService.downloadFile(athlete.getMedicalCertificate());
    }

    public String getMedicalCertificateContentType(Long athleteId) {
        Athlete athlete = athleteRepository.findById(athleteId)
                .orElseThrow(() -> new EntityNotFoundException("Athlète introuvable"));

        if (athlete.getMedicalCertificate() == null) {
            throw new EntityNotFoundException("Aucun certificat médical trouvé");
        }

        return athlete.getMedicalCertificate().getContentType();
    }

    @Transactional
    public void deleteMedicalCertificate(Long athleteId) {
        Athlete athlete = athleteRepository.findById(athleteId)
                .orElseThrow(() -> new EntityNotFoundException("Athlète introuvable"));

        if (athlete.getMedicalCertificate() == null) {
            throw new EntityNotFoundException("Aucun certificat médical trouvé");
        }

        storageService.deleteFile(athlete.getMedicalCertificate());
        athlete.setMedicalCertificate(null);
        athleteRepository.save(athlete);
    }

    @Transactional
    public void uploadPassport(Long athleteId, MultipartFile file) {
        Athlete athlete = athleteRepository.findById(athleteId)
                .orElseThrow(() -> new EntityNotFoundException("Athlète introuvable"));

        if (athlete.getPassportDocument() != null) {
            storageService.deleteFile(athlete.getPassportDocument());
        }

        String keyPrefix = "athletes/" + athleteId + "/passport";
        Document document = storageService.uploadFile(keyPrefix, file);

        athlete.setPassportDocument(document);
        athleteRepository.save(athlete);
    }

    public byte[] downloadPassport(Long athleteId) {
        Athlete athlete = athleteRepository.findById(athleteId)
                .orElseThrow(() -> new EntityNotFoundException("Athlète introuvable"));

        if (athlete.getPassportDocument() == null) {
            throw new EntityNotFoundException("Aucun passeport trouvé");
        }

        return storageService.downloadFile(athlete.getPassportDocument());
    }

    public String getPassportContentType(Long athleteId) {
        Athlete athlete = athleteRepository.findById(athleteId)
                .orElseThrow(() -> new EntityNotFoundException("Athlète introuvable"));

        if (athlete.getPassportDocument() == null) {
            throw new EntityNotFoundException("Aucun passeport trouvé");
        }

        return athlete.getPassportDocument().getContentType();
    }

    @Transactional
    public void deletePassport(Long athleteId) {
        Athlete athlete = athleteRepository.findById(athleteId)
                .orElseThrow(() -> new EntityNotFoundException("Athlète introuvable"));

        if (athlete.getPassportDocument() == null) {
            throw new EntityNotFoundException("Aucun passeport trouvé");
        }

        storageService.deleteFile(athlete.getPassportDocument());
        athlete.setPassportDocument(null);
        athleteRepository.save(athlete);
    }
}
