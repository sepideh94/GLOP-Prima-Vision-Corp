package com.ciblorgasport.email;

import org.junit.jupiter.api.Test;

class EmailServiceTestImplTest {

    @Test
    void shouldAcceptAllEmailMethodsWithoutThrowing() {
        EmailServiceTestImpl service = new EmailServiceTestImpl();

        service.sendActivationEmail("a@test.com", "A", "t1");
        service.sendPasswordResetEmail("a@test.com", "A", "t2");
        service.sendCommissionnerInviteEmail("a@test.com", "A", "t3");
        service.sendAthleteInviteEmail("a@test.com", "A", "t4");
        service.sendVolonteerInviteEmail("a@test.com", "A", "t5");
        service.sendIncidentNotificationEmail("a@test.com", "A", "subj", "msg", "link");
        service.sendAccreditationValidatedEmail("a@test.com", "A");
        service.sendAccreditationRefusedEmail("a@test.com", "A", "reason");
        service.sendAdminAccreditationSubmittedEmail("admin@test.com", "Admin", "Com");
        service.sendCommissionerParticipationSubmittedEmail("a@test.com", "Com", "Ath");
        service.sendAthleteParticipationValidatedEmail("a@test.com", "Ath");
        service.sendAthleteParticipationRefusedEmail("a@test.com", "Ath", "passport", "reason");
    }
}
