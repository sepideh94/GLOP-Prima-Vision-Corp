package com.ciblorgasport.trial.round.application;

import java.util.List;

import com.ciblorgasport.trial.round.dto.RoundCreateRequest;
import com.ciblorgasport.trial.round.dto.RoundResponse;

public interface RoundService {
    RoundResponse create(RoundCreateRequest request);
    RoundResponse getById(Long id);
    List<RoundResponse> getAll();
    void delete(Long id);
}
