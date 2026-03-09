package com.ciblorgasport.volonteer.application;

import java.util.List;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import com.ciblorgasport.email.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class VolonteerInviteBatchService {
    private final EmailService emailService;

    @Async("mailExecutor")
    public void sendInvites(List<VolonteerInviteEmail> invites) {
        for (VolonteerInviteEmail i : invites) {
            try {
                emailService.sendVolonteerInviteEmail(i.email(), i.firstName(), i.token());
            } catch (Exception e) {
                log.warn("Échec de l'envoi du mail au volontaire {}", i.email(), e);
            }
        }
    }
}