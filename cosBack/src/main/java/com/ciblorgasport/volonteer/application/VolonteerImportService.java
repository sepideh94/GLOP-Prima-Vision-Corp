package com.ciblorgasport.volonteer.application;

import org.springframework.web.multipart.MultipartFile;

public interface VolonteerImportService {

    ImportResult importVolonteersForCompetition(MultipartFile file, Long competitionId) throws Exception;

    record ImportResult(int processed, int invited) {}
    
}