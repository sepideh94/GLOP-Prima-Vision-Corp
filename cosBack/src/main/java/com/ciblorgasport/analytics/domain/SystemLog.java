package com.ciblorgasport.analytics.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SystemLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username; 
    private String actionType; 
    private String details; 
    private LocalDateTime timestamp;
}