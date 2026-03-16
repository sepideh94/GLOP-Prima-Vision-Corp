package com.ciblorgasport.volonteer.domain;

import java.time.LocalDateTime;

import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.competition.domain.ParticipationStatus;
import com.ciblorgasport.site.domain.Site;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "volonteer_assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VolonteerAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "volonteer_id", nullable = false)
    private Volonteer volonteer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "competition_id", nullable = false)
    private Competition competition;

    @Enumerated(EnumType.STRING)
    private ParticipationStatus status;
    
    private LocalDateTime startTime; 
    private LocalDateTime endTime;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_site")
    private Site site;
    
    private String title;
}