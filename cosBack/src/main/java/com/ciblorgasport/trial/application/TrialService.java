package com.ciblorgasport.trial.application;

import java.util.List;

import com.ciblorgasport.trial.dto.TrialCreateRequest;
import com.ciblorgasport.trial.dto.TrialResponse;
import com.ciblorgasport.trial.dto.TrialUpdateRequest;

public interface TrialService {

    TrialResponse create(TrialCreateRequest request);

    TrialResponse update(Long id, TrialUpdateRequest request);

    TrialResponse getById(Long id);

    List<TrialResponse> getAll();

    List<TrialResponse> getByCompetitionId(Long competitionId);

    void delete(Long id);
}
