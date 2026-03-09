package com.ciblorgasport.schedule;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ciblorgasport.schedule.domain.ScheduleItem;

@Repository
public interface ScheduleRepository extends JpaRepository<ScheduleItem, Long> {

}
