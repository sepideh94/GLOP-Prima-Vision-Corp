package com.ciblorgasport.trial.application;

import java.util.List;

import com.ciblorgasport.trial.dto.ResultResponse;

public interface TrialResultService {

    List<ResultResponse> getResultsByTrialId(Long trialId);
}
