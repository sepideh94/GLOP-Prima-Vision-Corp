package com.ciblorgasport.round.application;

import java.util.List;

import com.ciblorgasport.round.dto.RoundCreateRequest;
import com.ciblorgasport.round.dto.RoundResponse;

public interface RoundService {
    RoundResponse create(RoundCreateRequest request);
    RoundResponse getById(Long id);
    List<RoundResponse> getAll();
    void delete(Long id);
}
