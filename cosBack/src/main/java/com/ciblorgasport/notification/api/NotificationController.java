package com.ciblorgasport.notification.api;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ciblorgasport.notification.application.NotificationService;
import com.ciblorgasport.notification.dto.NotificationResponse;
import com.ciblorgasport.user.domain.UserAccount;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/me")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            @AuthenticationPrincipal UserAccount actor
    ) {
        return ResponseEntity.ok(notificationService.getMyNotifications(actor));
    }

    @GetMapping("/me/unread-count")
    public ResponseEntity<Map<String, Long>> countUnread(
            @AuthenticationPrincipal UserAccount actor
    ) {
        long count = notificationService.countUnread(actor);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserAccount actor
    ) {
        notificationService.markAsRead(id, actor);
        return ResponseEntity.noContent().build();
    }
}