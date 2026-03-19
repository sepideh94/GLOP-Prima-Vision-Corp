package com.ciblorgasport.notification.dto;

import com.ciblorgasport.user.domain.UserAccount;

public record NotificationRecipient(
        UserAccount user,
        String email,
        String displayName
) {
}