package com.ciblorgasport.notification.infrastructure;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ciblorgasport.notification.domain.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipient_IdOrderBySentAtDesc(Long recipientId);

    long countByRecipient_IdAndIsReadFalse(Long recipientId);

    List<Notification> findByIncident_Id(Long incidentId);

    void deleteByIncident_Id(Long incidentId);
}