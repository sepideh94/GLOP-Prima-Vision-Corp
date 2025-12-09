package com.ciblorgasport.site.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ciblorgasport.site.domain.Site;

public interface SiteRepository extends JpaRepository<Site, Long> {

}
