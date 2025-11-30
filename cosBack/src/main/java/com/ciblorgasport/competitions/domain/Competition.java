package com.ciblorgasport.competitions.domain;



import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "competition")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Competition {
 
 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 private String name;
 private String description;
 private LocalDate startDate;


 @OneToMany(mappedBy = "competition", cascade = CascadeType.ALL, orphanRemoval = true)
 private List<Trial> trials;


 @ManyToOne(fetch = FetchType.LAZY)
 @JoinColumn(name = "event_id", nullable = false) 
 private Event parentEvent;
 
}