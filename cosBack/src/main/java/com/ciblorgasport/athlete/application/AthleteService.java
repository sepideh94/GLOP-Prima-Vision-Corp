package com.ciblorgasport.athlete.application;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.athlete.dto.AthleteProfileUpdateRequest;
import com.ciblorgasport.athlete.dto.AthleteResponse;
import com.ciblorgasport.athlete.dto.CompetitionAthleteResponse;
import com.ciblorgasport.athlete.infrastructure.AthleteRepository;
import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.competition.domain.Participation;
import com.ciblorgasport.competition.domain.ParticipationStatus;
import com.ciblorgasport.competition.infrastructure.ParticipationRepository;
import com.ciblorgasport.storage.application.StorageService;
import com.ciblorgasport.storage.domain.Document;
import com.ciblorgasport.team.application.TeamValidationService;
import com.ciblorgasport.commissionner.CommissionerRepository;
import com.ciblorgasport.commissionner.Commissionner;
import com.ciblorgasport.email.EmailService;
import com.ciblorgasport.notification.application.NotificationService;
import com.ciblorgasport.notification.domain.NotificationType;
import com.ciblorgasport.trial.domain.TrialParticipant;
import com.ciblorgasport.trial.dto.TrialParticipantResponse;
import com.ciblorgasport.trial.infrastructure.TrialParticipantRepository;

import com.ciblorgasport.user.infrastructure.UserAccountRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AthleteService {

    private final AthleteRepository athleteRepository;
    private final ParticipationRepository participationRepository;
    private final StorageService storageService;
    private final TeamValidationService teamValidationService;
    private final CommissionerRepository commissionerRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final UserAccountRepository userAccountRepository;
    private final TrialParticipantRepository trialParticipantRepository;

    @Transactional
    public List<AthleteResponse> getAllAthletes() {
        return athleteRepository.findAllByOrderByLastNameAsc().stream()
                .map(AthleteResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<CompetitionAthleteResponse> getAthletesByCompetition(Long competitionId) {
        List<Participation> participations = participationRepository.findByCompetition_Id(competitionId);

        List<Participation> athleteParticipations = participations.stream()
                .filter(p -> p.getCompetitorType() == CompetitorType.ATHLETE)
                .toList();

        List<Long> athleteIds = athleteParticipations.stream()
                .map(Participation::getCompetitorId)
                .distinct()
                .toList();

        Map<Long, Athlete> athleteById = athleteRepository.findAllById(athleteIds).stream()
                .collect(Collectors.toMap(Athlete::getId, a -> a));

        return athleteParticipations.stream()
                .map(p -> {
                    Athlete athlete = athleteById.get(p.getCompetitorId());
                    if (athlete == null) {
                        return null;
                    }
                    return CompetitionAthleteResponse.builder()
                            .athlete(AthleteResponse.fromEntity(athlete))
                            .status(p.getStatus())
                            .participationId(p.getId())
                            .build();
                })
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(r -> r.getAthlete().getLastName(), String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());
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

        if (request.getHasAcceptedCharte() != null) {
            if (request.getHasAcceptedCharte() && !athlete.isHasAcceptedCharte()) {
                athlete.setCharterAcceptedAt(LocalDateTime.now());
            }
            athlete.setHasAcceptedCharte(request.getHasAcceptedCharte());
        }

        Athlete saved = athleteRepository.save(athlete);

        this.checkAndConfirmParticipations(saved);

        return AthleteResponse.fromEntity(saved);
    }

    private void checkAndConfirmParticipations(Athlete athlete) {
        if (athlete.isProfileComplete() && athlete.isHasAcceptedCharte()) {
            List<Participation> participations = participationRepository
                    .findByCompetitorIdAndCompetitorType(athlete.getId(), CompetitorType.ATHLETE);

            boolean newlySubmitted = false;

            for (Participation p : participations) {
                if (p.getStatus() == ParticipationStatus.PENDING) {
                    p.setStatus(ParticipationStatus.PENDING_VALIDATION);
                    newlySubmitted = true;
                } else if (p.getStatus() != ParticipationStatus.CONFIRMED && p.getStatus() != ParticipationStatus.PENDING_VALIDATION) {
                    p.setStatus(ParticipationStatus.PENDING_VALIDATION);
                    newlySubmitted = true;
                } else if (p.getStatus() == ParticipationStatus.PENDING_VALIDATION) {
                    // Already pending validation, no newly submitted state change
                }

                p.setCharterAccepted(true);
                p.setCharterAcceptedAt(athlete.getCharterAcceptedAt());

                participationRepository.saveAndFlush(p);

                teamValidationService.validateTeamStatus(athlete.getId(), p.getCompetition().getId());
            }

            if (newlySubmitted) {
                List<Commissionner> commissionners = commissionerRepository.findAll();
                String athleteName = athlete.getFirstName() + " " + athlete.getLastName();
                for (Commissionner c : commissionners) {
                    userAccountRepository.findById(c.getId()).ifPresent(user -> {
                        emailService.sendCommissionerParticipationSubmittedEmail(user.getEmail(), user.getFirstName(), athleteName);
                        notificationService.createSystemNotification(
                            user, 
                            NotificationType.PARTICIPATION_SUBMITTED, 
                            "Nouveaux documents", 
                            "L'athlète " + athleteName + " a soumis ses documents justificatifs.", 
                            "/commissioner/participations"
                        );
                    });
                }
            }
        }
    }

    @Transactional
    public TrialParticipantResponse declareTrialForfeit(Long athleteId, Long participationId) {
        athleteRepository.findById(athleteId)
                .orElseThrow(() -> new EntityNotFoundException("Athlète introuvable"));

        TrialParticipant participant = trialParticipantRepository
                .findAccessibleByIdForAthlete(participationId, athleteId)
                .orElseThrow(() -> new EntityNotFoundException("Participation à l'épreuve introuvable"));

        participant.declareForfeit();

        TrialParticipant saved = trialParticipantRepository.save(participant);

        return TrialParticipantResponse.fromEntity(saved);
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
        Athlete savedAthlete = athleteRepository.save(athlete);

        checkAndConfirmParticipations(savedAthlete);
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
        Athlete savedAthlete = athleteRepository.save(athlete);

        checkAndConfirmParticipations(savedAthlete);
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
