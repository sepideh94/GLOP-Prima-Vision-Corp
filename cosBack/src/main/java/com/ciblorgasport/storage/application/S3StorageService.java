package com.ciblorgasport.storage.application;

import java.io.IOException;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ciblorgasport.storage.domain.Document;
import com.ciblorgasport.storage.infrastructure.DocumentRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3StorageService implements StorageService {

	private final S3Client s3Client;
	private final DocumentRepository documentRepository;

	@Value("${storage.s3.bucket-name}")
	private String bucketName;

	@Override
	public Document uploadFile(String keyPrefix, MultipartFile file) {
		ensureBucketExists();

		String s3Key = keyPrefix + "/" + UUID.randomUUID() + "-" + file.getOriginalFilename();

		try {
			PutObjectRequest putRequest = PutObjectRequest.builder()
					.bucket(bucketName)
					.key(s3Key)
					.contentType(file.getContentType())
					.contentLength(file.getSize())
					.build();

			s3Client.putObject(putRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

			Document document = Document.builder()
					.fileName(file.getOriginalFilename())
					.s3Key(s3Key)
					.bucketName(bucketName)
					.contentType(file.getContentType())
					.fileSize(file.getSize())
					.build();

			return documentRepository.save(document);
		} catch (IOException e) {
			throw new RuntimeException("Erreur lors de l'upload du fichier", e);
		}
	}

	@Override
	public byte[] downloadFile(Document document) {
		GetObjectRequest getRequest = GetObjectRequest.builder()
				.bucket(document.getBucketName())
				.key(document.getS3Key())
				.build();

		try {
			return s3Client.getObject(getRequest).readAllBytes();
		} catch (IOException e) {
			throw new RuntimeException("Erreur lors du téléchargement du fichier", e);
		}
	}

	@Override
	public void deleteFile(Document document) {
		DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
				.bucket(document.getBucketName())
				.key(document.getS3Key())
				.build();

		s3Client.deleteObject(deleteRequest);
		documentRepository.delete(document);
	}

	private void ensureBucketExists() {
		try {
			s3Client.headBucket(HeadBucketRequest.builder().bucket(bucketName).build());
		} catch (NoSuchBucketException e) {
			s3Client.createBucket(CreateBucketRequest.builder().bucket(bucketName).build());
			log.info("Bucket '{}' créé", bucketName);
		}
	}
}
