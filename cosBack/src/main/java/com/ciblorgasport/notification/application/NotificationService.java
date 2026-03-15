package com.ciblorgasport.notification.application;

import java.util.List;

import com.ciblorgasport.notification.domain.Notification;
import com.ciblorgasport.notification.domain.NotificationType;
import com.ciblorgasport.notification.dto.NotificationResponse;
import com.ciblorgasport.user.domain.UserAccount;

public interface NotificationService {

    Notification createNotification(
            UserAccount recipient,
            NotificationType type,
            String title,
            String message,
            String link
    );

    void markAsRead(Long notificationId, UserAccount actor);

    List<NotificationResponse> getMyNotifications(UserAccount actor);

    long countUnread(UserAccount actor);
}