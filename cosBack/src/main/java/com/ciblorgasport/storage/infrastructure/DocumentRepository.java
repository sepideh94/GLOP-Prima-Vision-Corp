package com.ciblorgasport.storage.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ciblorgasport.storage.domain.Document;

public interface DocumentRepository extends JpaRepository<Document, Long> {
}
