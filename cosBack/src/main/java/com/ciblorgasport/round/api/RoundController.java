package com.ciblorgasport.round.api;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ciblorgasport.round.application.RoundService;
import com.ciblorgasport.round.dto.RoundCreateRequest;
import com.ciblorgasport.round.dto.RoundResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/rounds")
@RequiredArgsConstructor
public class RoundController {

    private final RoundService roundService;

    @PostMapping
    public ResponseEntity<RoundResponse> createRound(@Valid @RequestBody RoundCreateRequest request) {
        RoundResponse newRound = roundService.create(request);
        return new ResponseEntity<>(newRound, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<RoundResponse>> getAllRounds() {
        List<RoundResponse> rounds = roundService.getAll();
        return ResponseEntity.ok(rounds);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoundResponse> getRoundById(@PathVariable("id") Long id) {
        RoundResponse round = roundService.getById(id);
        return ResponseEntity.ok(round);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRound(@PathVariable("id") Long id) {
        roundService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
