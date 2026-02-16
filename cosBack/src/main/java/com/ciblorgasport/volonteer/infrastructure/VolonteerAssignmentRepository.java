package com.ciblorgasport.volonteer.infrastructure;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ciblorgasport.volonteer.domain.VolonteerAssignment;

public interface VolonteerAssignmentRepository extends JpaRepository<VolonteerAssignment, Long> {

	boolean existsByVolonteerIdAndCompetitionId(Long volonteerId, Long competitionId);

	List<VolonteerAssignment> findByVolonteerId(Long volonteerId);
}