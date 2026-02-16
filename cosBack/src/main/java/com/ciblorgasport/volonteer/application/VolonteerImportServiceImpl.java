package com.ciblorgasport.volonteer.application;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;
import com.ciblorgasport.volonteer.domain.Volonteer;
import com.ciblorgasport.volonteer.domain.VolonteerAssignment;
import com.ciblorgasport.volonteer.infrastructure.VolonteerAssignmentRepository;
import com.ciblorgasport.volonteer.infrastructure.VolonteerRepository;
import com.ciblorgasport.common.service.CsvImportService;
import com.ciblorgasport.competition.domain.*;
import com.ciblorgasport.competition.infrastructure.*;
import com.ciblorgasport.user.dto.CreateUserRequest;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class VolonteerImportServiceImpl implements VolonteerImportService {

    private final CsvImportService csvService;
    private final VolonteerCreationService volonteerCreationService;
    private final VolonteerRepository volonteerRepository;
    private final CompetitionRepository competitionRepository;
    private final VolonteerInviteTokenService volonteerInviteTokenService;
    private final VolonteerInviteBatchService volonteerInviteBatchService;
    private final VolonteerAssignmentRepository assignmentRepository;

    @Override
    @Transactional
    public ImportResult importVolonteersForCompetition(MultipartFile file, Long competitionId) throws Exception {
        Competition competition = competitionRepository.findById(competitionId)
                .orElseThrow(() -> new EntityNotFoundException("Compétition non trouvée avec l'ID: " + competitionId));

        List<CSVRecord> records = csvService.parseCsv(file);
        List<VolonteerInviteEmail> invitesToSend = new ArrayList<>();
        int invitedCount = 0;

        for (CSVRecord record : records) {
            try {
                Volonteer volonteer = getOrCreateVolonteer(record);
                boolean wasInvited = inviteToCompetition(volonteer, competition);

                if (wasInvited) {
                    invitedCount++;
                    if (!volonteer.isActive()) {
                        String token = volonteerInviteTokenService.createInviteToken(volonteer);
                        invitesToSend.add(new VolonteerInviteEmail(volonteer.getEmail(), volonteer.getFirstName(), token));
                    }
                }
            } catch (Exception e) {
                log.error("Erreur lors du traitement de l'email {}: {}", record.get("email"), e.getMessage());
            }
        }

        if (!invitesToSend.isEmpty()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    volonteerInviteBatchService.sendInvites(invitesToSend);
                }
            });
        }

        return new ImportResult(records.size(), invitedCount);
    }

    private Volonteer getOrCreateVolonteer(CSVRecord record) {
        String email = record.get("email").trim().toLowerCase();
        
        return volonteerRepository.findByEmail(email)
                .orElseGet(() -> {
                    String tempPassword = UUID.randomUUID().toString().substring(0, 8);
                    
                    CreateUserRequest request = CreateUserRequest.builder()
                            .email(email)
                            .firstName(record.get("firstName"))
                            .lastName(record.get("lastName"))
                            .password(tempPassword)
                            .build();
                            
                    return (Volonteer) volonteerCreationService.createUser(request);
                });
    }

    private boolean inviteToCompetition(Volonteer v, Competition c) {
        if (assignmentRepository.existsByVolonteerIdAndCompetitionId(v.getId(), c.getId())) {
            log.info("Le volontaire {} est déjà affecté à la compétition {}", v.getEmail(), c.getName());
            return false;
        }

        VolonteerAssignment assignment = VolonteerAssignment.builder()
                .volonteer(v)
                .competition(c)
                .status(ParticipationStatus.INVITED)
                .build();

        assignmentRepository.save(assignment);
        return true;
    }
}