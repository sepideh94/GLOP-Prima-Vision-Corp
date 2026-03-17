package com.ciblorgasport.volonteer.application;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;
import com.ciblorgasport.volonteer.domain.Volonteer;
import com.ciblorgasport.volonteer.domain.VolonteerAssignment;
import com.ciblorgasport.volonteer.domain.VolonteerCompetitionResponse;
import com.ciblorgasport.volonteer.infrastructure.VolonteerAssignmentRepository;
import com.ciblorgasport.volonteer.infrastructure.VolonteerRepository;
import com.ciblorgasport.common.service.CsvImportService;
import com.ciblorgasport.competition.domain.*;
import com.ciblorgasport.competition.infrastructure.*;
import com.ciblorgasport.event.infrastructure.EventRepository;
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
        //List<VolonteerInviteEmail> invitesToSend = new ArrayList<>();
        int invitedCount = 0;

        for (CSVRecord record : records) {
            try {
                Volonteer volonteer = getOrCreateVolonteer(record);
                boolean wasInvited = inviteToCompetitionEntity(volonteer, competition);
                if (wasInvited) {
                    invitedCount++;
                    /*if (!volonteer.isActive()) {
                        String token = volonteerInviteTokenService.createInviteToken(volonteer);
                        invitesToSend.add(new VolonteerInviteEmail(volonteer.getEmail(), volonteer.getFirstName(), token));
                    }*/
                }
            } catch (Exception e) {
                log.error("Erreur lors du traitement de l'email {}: {}", record.get("email"), e.getMessage());
            }
        }

        /*if (!invitesToSend.isEmpty()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    volonteerInviteBatchService.sendInvites(invitesToSend);
                }
            });
        }*/

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

    public boolean inviteToCompetition(Volonteer v, Long competitionId) {
        Competition competition = competitionRepository.findById(competitionId)
                .orElseThrow(() -> new EntityNotFoundException("Compétition non trouvée"));
        return inviteToCompetitionEntity(v, competition);
    }

    private boolean inviteToCompetitionEntity(Volonteer v, Competition c) {
        if (assignmentRepository.existsByVolonteerIdAndCompetitionId(v.getId(), c.getId())) {
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

    @Override
    @Transactional
    public void updateVolonteerAssignmentsToAccepted(Long volonteerId) {

    	List<VolonteerAssignment> assignments = assignmentRepository.findByVolonteerId(volonteerId);
        
        assignments.forEach(assignment -> {
            assignment.setStatus(ParticipationStatus.CONFIRMED);
            assignmentRepository.save(assignment);
        });
        
        log.info("Statut mis à jour pour {} assignation(s) du volontaire ID: {}", assignments.size(), volonteerId);
    }
    
    @Override
    public List<VolonteerCompetitionResponse> getVolonteersByCompetition(Long competitionId) {
        return assignmentRepository.findByCompetitionId(competitionId).stream()
                .filter(assignment -> assignment.getStartTime() == null) 
                .map(assignment -> {
                    Volonteer v = assignment.getVolonteer();
                    return VolonteerCompetitionResponse.builder()
                            .id(v.getId())
                            .firstName(v.getFirstName())
                            .lastName(v.getLastName())
                            .email(v.getEmail())
                            .status(assignment.getStatus()) 
                            .competitionId(assignment.getCompetition().getId())
                            .competitionName(assignment.getCompetition().getName())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<VolonteerCompetitionResponse> getAllVolonteersByEvent(Long eventId) {
        List<Competition> competitions = competitionRepository.findByParentEventId(eventId);
        
        return competitions.stream()
                .flatMap(competition -> assignmentRepository.findByCompetitionId(competition.getId()).stream())
                .filter(assignment -> assignment.getStartTime() == null)
                .map(assignment -> {
                    Volonteer v = assignment.getVolonteer();
                    return VolonteerCompetitionResponse.builder()
                            .id(v.getId())
                            .firstName(v.getFirstName())
                            .lastName(v.getLastName())
                            .email(v.getEmail())
                            .status(assignment.getStatus())
                            .competitionId(assignment.getCompetition().getId())
                            .competitionName(assignment.getCompetition().getName())
                            .build();
                })
                .collect(Collectors.toList());
    }
}