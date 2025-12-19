package com.ciblorgasport.round.domain;

import java.util.List;

import com.ciblorgasport.trial.domain.Trial;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "round")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Round {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private RoundName name;

    @OneToMany(mappedBy = "round", cascade = CascadeType.ALL)
    private List<Trial> trials;

    /**
     * Get the order based on the RoundName type
     * This is calculated automatically from the enum
     */
    public Integer getOrderNumber() {
        return name != null ? name.getOrder() : null;
    }

    /**
     * Get the display name
     */
    public String getDisplayName() {
        return name != null ? name.getDisplayName() : null;
    }
}
