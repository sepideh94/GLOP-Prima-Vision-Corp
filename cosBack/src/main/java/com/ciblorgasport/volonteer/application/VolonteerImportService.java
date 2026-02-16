package com.ciblorgasport.volonteer.application;

import org.springframework.web.multipart.MultipartFile;

import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.volonteer.domain.Volonteer;

public interface VolonteerImportService {

    ImportResult importVolonteersForCompetition(MultipartFile file, Long competitionId) throws Exception;

    record ImportResult(int processed, int invited) {}
    boolean inviteToCompetition(Volonteer v, Long competitionId);
    void updateVolonteerAssignmentsToAccepted(Long volonteerId);
}