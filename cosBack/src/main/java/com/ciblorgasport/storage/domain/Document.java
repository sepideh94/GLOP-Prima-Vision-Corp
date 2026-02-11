package com.ciblorgasport.storage.domain;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "document")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "file_name", nullable = false)
	private String fileName;

	@Column(name = "s3_key", nullable = false, unique = true)
	private String s3Key;

	@Column(name = "bucket_name", nullable = false)
	private String bucketName;

	@Column(name = "content_type")
	private String contentType;

	@Column(name = "file_size")
	private Long fileSize;

	@Column(name = "uploaded_at", nullable = false, updatable = false)
	@Builder.Default
	private LocalDateTime uploadedAt = LocalDateTime.now();
}
