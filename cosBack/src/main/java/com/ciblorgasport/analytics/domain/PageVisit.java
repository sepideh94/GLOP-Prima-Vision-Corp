package com.ciblorgasport.analytics.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "page_visit")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PageVisit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String section;

    @Column(name = "user_role", nullable = false)
    private String userRole;

    @Column(nullable = false)
    private LocalDateTime timestamp;
}
