package com.ciblorgasport.volonteer.infrastructure;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.ciblorgasport.volonteer.domain.Volonteer;

public interface VolonteerRepository extends JpaRepository<Volonteer, Long> {
    Optional<Volonteer> findByEmail(String email);
}