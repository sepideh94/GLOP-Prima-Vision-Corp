package com.ciblorgasport.storage.application;

import org.springframework.web.multipart.MultipartFile;

import com.ciblorgasport.storage.domain.Document;

public interface StorageService {

	Document uploadFile(String keyPrefix, MultipartFile file);

	byte[] downloadFile(Document document);

	void deleteFile(Document document);
}
