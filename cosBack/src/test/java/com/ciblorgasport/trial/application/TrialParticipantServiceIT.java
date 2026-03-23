package com.ciblorgasport.trial.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.athlete.infrastructure.AthleteRepository;
import com.ciblorgasport.competition.domain.CompetitorType;
import com.ciblorgasport.trial.domain.Trial;
import com.ciblorgasport.trial.domain.TrialParticipant;
import com.ciblorgasport.trial.domain.TrialParticipantStatus;
import com.ciblorgasport.trial.infrastructure.TrialParticipantRepository;
import com.ciblorgasport.trial.infrastructure.TrialRepository;

import jakarta.persistence.EntityNotFoundException;

@SpringBootTest
@Transactional
class TrialParticipantServiceIT {

    @Autowired
    private TrialParticipantService trialParticipantService;

    @Autowired
    private TrialParticipantRepository trialParticipantRepository;

    @Autowired
    private TrialRepository trialRepository;

    @Autowired
    private AthleteRepository athleteRepository;

    private Athlete savedAthlete;
    private Trial savedTrial;
    private TrialParticipant savedParticipant;

    @BeforeEach
    void setUp() {
        // ایجاد ورزشکار
        Athlete athlete = new Athlete();
        athlete.setFirstName("Jean");
        athlete.setLastName("Dupont");
        athlete.setEmail("jean.dupont@test.com");
        athlete.setPassword("password");
        athlete.setActive(true);
        savedAthlete = athleteRepository.save(athlete);

        // ایجاد Trial (فیلد زمان را بر اساس نام دقیق مدل خودتان در دیتابیس ست کنید)
        Trial trial = new Trial();
        // اگر متد setStartTime خطا می‌دهد، فعلاً آن را حذف می‌کنیم چون به صورت پیش‌فرض 
        // در متد hasStarted کلاس TrialParticipant شما چک می‌شود.
        savedTrial = trialRepository.save(trial);

        // ایجاد مشارکت
        TrialParticipant participant = TrialParticipant.builder()
                .trial(savedTrial)
                .competitorId(savedAthlete.getId())
                .competitorType(CompetitorType.ATHLETE)
                .status(TrialParticipantStatus.ACTIVE)
                .build();
        savedParticipant = trialParticipantRepository.save(participant);
    }

    @Test
    void shouldSuccessfullyDeclareForfeit() {
        trialParticipantService.declareForfeit(savedParticipant.getId(), savedAthlete.getId());

        TrialParticipant updatedParticipant = trialParticipantRepository.findById(savedParticipant.getId()).orElseThrow();
        assertThat(updatedParticipant.getStatus()).isEqualTo(TrialParticipantStatus.FORFEIT);
    }

    @Test
    void shouldThrowExceptionWhenParticipationNotFound() {
        assertThrows(EntityNotFoundException.class, () -> {
            trialParticipantService.declareForfeit(999L, savedAthlete.getId());
        });
    }

    @Test
    void shouldThrowExceptionWhenAthleteDoesNotOwnParticipation() {
        assertThrows(EntityNotFoundException.class, () -> {
            trialParticipantService.declareForfeit(savedParticipant.getId(), 888L);
        });
    }

    @Test
    void shouldThrowIllegalStateExceptionWhenAlreadyForfeit() {
        savedParticipant.setStatus(TrialParticipantStatus.FORFEIT);
        trialParticipantRepository.save(savedParticipant);

        assertThrows(IllegalStateException.class, () -> {
            trialParticipantService.declareForfeit(savedParticipant.getId(), savedAthlete.getId());
        });
    }
}