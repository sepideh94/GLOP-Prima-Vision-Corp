package com.ciblorgasport.notification.application;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ciblorgasport.notification.dto.NotificationRecipient;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SpectatorIncidentRecipientResolver {

    private final UserAccountRepository userAccountRepository;

    public List<NotificationRecipient> resolve() {
        return userAccountRepository.findAll().stream()
                .filter(user -> user != null && user.getId() != null)
                .filter(user -> user.isSpectator())
                .filter(user -> user.isActive())
                .filter(user -> user.getEmail() != null && !user.getEmail().isBlank())
                .map(user -> new NotificationRecipient(
                        user,
                        user.getEmail(),
                        buildDisplayName(user.getFirstName(), user.getLastName())
                ))
                .toList();
    }

    private String buildDisplayName(String firstName, String lastName) {
        String first = firstName == null ? "" : firstName.trim();
        String last = lastName == null ? "" : lastName.trim();
        String full = (first + " " + last).trim();
        return full.isBlank() ? "spectateur" : full;
    }
}