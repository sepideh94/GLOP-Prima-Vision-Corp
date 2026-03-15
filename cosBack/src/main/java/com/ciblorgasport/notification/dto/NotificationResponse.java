package com.ciblorgasport.notification.dto;

import java.time.LocalDateTime;

import com.ciblorgasport.notification.domain.NotificationType;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class NotificationResponse {
    Long id;
    NotificationType type;
    String title;
    String message;
    String link;
    Boolean isRead;
    LocalDateTime sentAt;
}