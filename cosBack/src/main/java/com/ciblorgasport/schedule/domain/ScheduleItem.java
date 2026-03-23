package com.ciblorgasport.schedule.domain;


import com.ciblorgasport.common.model.Status;
import com.ciblorgasport.competition.domain.Competition;
import com.ciblorgasport.site.domain.Site;
import com.ciblorgasport.user.domain.UserAccount;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "schedule_item")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private LocalDateTime startTime;
    
    @Column(nullable = false)
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    private ScheduleType type;

    @Enumerated(EnumType.STRING)
    private Status status = Status.UPCOMING; 

    @ManyToOne
    @JoinColumn(name = "id_site")
    private Site site; 

    @ManyToOne
    @JoinColumn(name = "id_competition")
    private Competition competition;

    @ManyToOne
    @JoinColumn(name = "id_assigned_user")
    private UserAccount assignedUser; 

    @ManyToOne
    @JoinColumn(name = "id_created_by")
    private UserAccount createdBy; 
}