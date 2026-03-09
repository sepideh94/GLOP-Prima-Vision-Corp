package com.ciblorgasport.volonteer.application;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.volonteer.domain.Volonteer;
import com.ciblorgasport.volonteer.domain.VolonteerCompetitionResponse;

public interface VolonteerImportService {

    ImportResult importVolonteersForCompetition(MultipartFile file, Long competitionId) throws Exception;

    record ImportResult(int processed, int invited) {}
    boolean inviteToCompetition(Volonteer v, Long competitionId);
    void updateVolonteerAssignmentsToAccepted(Long volonteerId);
    List<VolonteerCompetitionResponse> getVolonteersByCompetition(Long competitionId);
    List<VolonteerCompetitionResponse> getAllVolonteersByEvent(Long eventId);
}