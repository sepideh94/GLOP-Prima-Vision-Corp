package com.ciblorgasport.athlete.application;

import java.util.List;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.ciblorgasport.email.EmailService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AthleteInviteBatchService {

    private final EmailService emailService;

    @Async("mailExecutor")
    public void sendInvites(List<AthleteInviteEmail> invites) {
        for (AthleteInviteEmail i : invites) {
            try {
                emailService.sendAthleteInviteEmail(i.email(), i.firstName(), i.token());
            } catch (Exception e) {
                log.warn("Failed to send athlete invite email to {}", i.email(), e);
            }
        }
    }
}
