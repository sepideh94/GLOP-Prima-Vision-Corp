package com.ciblorgasport.volonteer.infrastructure;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ciblorgasport.volonteer.domain.VolonteerAssignment;

public interface VolonteerAssignmentRepository extends JpaRepository<VolonteerAssignment, Long> {

	boolean existsByVolonteerIdAndCompetitionId(Long volonteerId, Long competitionId);

	List<VolonteerAssignment> findByVolonteerId(Long volonteerId);
	
	List<VolonteerAssignment> findByCompetitionId(Long competitionId);
	Optional<VolonteerAssignment> findByVolonteerIdAndCompetitionId(Long volonteerId, Long competitionId);
}