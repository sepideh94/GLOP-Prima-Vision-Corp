package com.ciblorgasport.team.domain;

import java.util.ArrayList;
import java.util.List;

import com.ciblorgasport.athlete.domain.Athlete;
import com.ciblorgasport.common.domain.Competitor;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "team")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Team implements Competitor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToMany
    @JoinTable(
        name = "team_athletes",
        joinColumns = @JoinColumn(name = "team_id"),
        inverseJoinColumns = @JoinColumn(name = "athlete_id")
    )
    @Builder.Default
    private List<Athlete> members = new ArrayList<>();

    @Override
    public Long getId() {
        return this.id;
    }

    @Override
    public String getDisplayName() {
        return this.name;
    }
    
    /**
     * Ajoute un athlète à l'équipe s'il n'y est pas déjà.
     */
    public void addMember(Athlete athlete) {
        if (athlete != null && !members.contains(athlete)) {
            members.add(athlete);
        }
    }
}