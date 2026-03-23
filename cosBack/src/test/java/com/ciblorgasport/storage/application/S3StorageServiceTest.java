package com.ciblorgasport.storage.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.ByteArrayInputStream;
import java.io.IOException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import com.ciblorgasport.storage.domain.Document;
import com.ciblorgasport.storage.infrastructure.DocumentRepository;

import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;

class S3StorageServiceTest {

    private S3Client s3Client;
    private DocumentRepository documentRepository;
    private S3StorageService service;

    @BeforeEach
    void setUp() {
        s3Client = mock(S3Client.class);
        documentRepository = mock(DocumentRepository.class);
        service = new S3StorageService(s3Client, documentRepository);
        ReflectionTestUtils.setField(service, "bucketName", "test-bucket");
    }

    @Test
    void uploadFile_shouldCreateBucketIfMissingAndPersistDocument() {
        MockMultipartFile file = new MockMultipartFile("file", "a.txt", "text/plain", "hello".getBytes());
        when(documentRepository.save(any(Document.class))).thenAnswer(invocation -> invocation.getArgument(0));
        doThrow(NoSuchBucketException.builder().message("missing").build())
                .when(s3Client).headBucket(any(software.amazon.awssdk.services.s3.model.HeadBucketRequest.class));

        Document saved = service.uploadFile("athlete", file);

        assertThat(saved.getBucketName()).isEqualTo("test-bucket");
        assertThat(saved.getFileName()).isEqualTo("a.txt");
        assertThat(saved.getS3Key()).contains("athlete/");
        verify(s3Client).createBucket(any(software.amazon.awssdk.services.s3.model.CreateBucketRequest.class));
        verify(s3Client).putObject(any(software.amazon.awssdk.services.s3.model.PutObjectRequest.class), any(RequestBody.class));
        verify(documentRepository).save(any(Document.class));
    }

    @Test
    void uploadFile_shouldNotCreateBucketWhenAlreadyExisting() {
        MockMultipartFile file = new MockMultipartFile("file", "b.txt", "text/plain", "hello".getBytes());
        when(documentRepository.save(any(Document.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.uploadFile("prefix", file);

        verify(s3Client, never()).createBucket(any(software.amazon.awssdk.services.s3.model.CreateBucketRequest.class));
        verify(s3Client).putObject(any(software.amazon.awssdk.services.s3.model.PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void uploadFile_shouldWrapIoException() throws Exception {
        org.springframework.web.multipart.MultipartFile file = mock(org.springframework.web.multipart.MultipartFile.class);
        when(file.getOriginalFilename()).thenReturn("broken.txt");
        when(file.getContentType()).thenReturn("text/plain");
        when(file.getSize()).thenReturn(3L);
        when(file.getInputStream()).thenThrow(new IOException("io"));

        assertThatThrownBy(() -> service.uploadFile("x", file))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("upload");
    }

    @Test
    void downloadFile_shouldReturnBytes() throws Exception {
        Document doc = Document.builder().bucketName("bucket").s3Key("key").build();
        @SuppressWarnings("unchecked")
        ResponseInputStream<GetObjectResponse> inputStream = mock(ResponseInputStream.class);
        when(inputStream.readAllBytes()).thenReturn("payload".getBytes());
        when(s3Client.getObject(any(GetObjectRequest.class))).thenReturn(inputStream);

        byte[] bytes = service.downloadFile(doc);

        assertThat(new String(bytes)).isEqualTo("payload");
        ArgumentCaptor<GetObjectRequest> requestCaptor = ArgumentCaptor.forClass(GetObjectRequest.class);
        verify(s3Client).getObject(requestCaptor.capture());
        assertThat(requestCaptor.getValue().bucket()).isEqualTo("bucket");
    }

    @Test
    void deleteFile_shouldDeleteOnS3AndRepository() {
        Document doc = Document.builder().bucketName("bucket").s3Key("key").build();

        service.deleteFile(doc);

        verify(s3Client).deleteObject(any(software.amazon.awssdk.services.s3.model.DeleteObjectRequest.class));
        verify(documentRepository).delete(doc);
    }
}
