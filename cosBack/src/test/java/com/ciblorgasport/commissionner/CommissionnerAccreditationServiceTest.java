package com.ciblorgasport.commissionner;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import com.ciblorgasport.admin.domain.Admin;
import com.ciblorgasport.email.EmailService;
import com.ciblorgasport.notification.application.NotificationService;
import com.ciblorgasport.notification.domain.NotificationType;
import com.ciblorgasport.storage.application.StorageService;
import com.ciblorgasport.storage.domain.Document;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;

import jakarta.persistence.EntityNotFoundException;

@ExtendWith(MockitoExtension.class)
class CommissionnerAccreditationServiceTest {

    @Mock
    private CommissionerRepository commissionnerRepository;

    @Mock
    private StorageService storageService;

    @Mock
    private EmailService emailService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private UserAccountRepository userAccountRepository;

    @InjectMocks
    private CommissionnerAccreditationService accreditationService;

    private Commissionner commissionner;
    private Document document;

    @BeforeEach
    void setUp() {
        commissionner = new Commissionner();
        commissionner.setId(1L);
        commissionner.setEmail("comm@ciblorgasport.local");
        commissionner.setFirstName("John");
        commissionner.setAccredited(false);

        document = new Document();
        document.setContentType("application/pdf");
        document.setBucketName("test-bucket");
        document.setS3Key("key.pdf");
    }

    @Test
    void uploadAccreditationForCurrentUser_WhenExistsAndHasDocument_ShouldReplaceAndNotify() {
        commissionner.setAccreditationDocument(document);
        MultipartFile file = mock(MultipartFile.class);
        Document newDoc = new Document();
        newDoc.setS3Key("new.pdf");

        Admin admin = new Admin();
        admin.setEmail("admin@ciblorgasport.local");
        admin.setFirstName("Marius");

        when(commissionnerRepository.findByEmail("comm@ciblorgasport.local")).thenReturn(Optional.of(commissionner));
        when(storageService.uploadFile(anyString(), eq(file))).thenReturn(newDoc);
        when(userAccountRepository.findAllAdmins()).thenReturn(List.of(admin));

        accreditationService.uploadAccreditationForCurrentUser("comm@ciblorgasport.local", file);

        verify(storageService).deleteFile(document);
        verify(storageService).uploadFile("commissionners/1/accreditation-cen", file);
        verify(commissionnerRepository).save(commissionner);
        assertFalse(commissionner.isAccredited());
        assertEquals(newDoc, commissionner.getAccreditationDocument());

        verify(emailService).sendAdminAccreditationSubmittedEmail("admin@ciblorgasport.local", "Marius", "John");
        verify(notificationService).createSystemNotification(
                eq(admin),
                eq(NotificationType.ACCREDITATION_SUBMITTED),
                anyString(),
                anyString(),
                anyString()
        );
    }

    @Test
    void downloadMyAccreditation_WhenHasDocument_ShouldReturnData() {
        commissionner.setAccreditationDocument(document);
        byte[] expectedData = "test-data".getBytes();

        when(commissionnerRepository.findByEmail("comm@ciblorgasport.local")).thenReturn(Optional.of(commissionner));
        when(storageService.downloadFile(document)).thenReturn(expectedData);

        byte[] result = accreditationService.downloadMyAccreditation("comm@ciblorgasport.local");

        assertNotNull(result);
        assertEquals(expectedData, result);
    }

    @Test
    void downloadMyAccreditation_WhenNoDocument_ShouldThrowException() {
        when(commissionnerRepository.findByEmail("comm@ciblorgasport.local")).thenReturn(Optional.of(commissionner));

        assertThrows(EntityNotFoundException.class, () -> {
            accreditationService.downloadMyAccreditation("comm@ciblorgasport.local");
        });
    }

    @Test
    void getMyAccreditationContentType_Success() {
        commissionner.setAccreditationDocument(document);
        when(commissionnerRepository.findByEmail("comm@ciblorgasport.local")).thenReturn(Optional.of(commissionner));

        String result = accreditationService.getMyAccreditationContentType("comm@ciblorgasport.local");
        assertEquals("application/pdf", result);
    }

    @Test
    void downloadAccreditationById_Success() {
        commissionner.setAccreditationDocument(document);
        byte[] expectedData = "test-data-id".getBytes();

        when(commissionnerRepository.findById(1L)).thenReturn(Optional.of(commissionner));
        when(storageService.downloadFile(document)).thenReturn(expectedData);

        byte[] result = accreditationService.downloadAccreditationById(1L);

        assertNotNull(result);
        assertEquals(expectedData, result);
    }

    @Test
    void getAccreditationContentTypeById_Success() {
        commissionner.setAccreditationDocument(document);
        when(commissionnerRepository.findById(1L)).thenReturn(Optional.of(commissionner));

        String result = accreditationService.getAccreditationContentTypeById(1L);
        assertEquals("application/pdf", result);
    }

    @Test
    void validateAccreditation_WhenValid_ShouldSetTrueAndNotify() {
        when(commissionnerRepository.findById(1L)).thenReturn(Optional.of(commissionner));

        accreditationService.validateAccreditation(1L, true, null);

        assertTrue(commissionner.isAccredited());
        verify(emailService).sendAccreditationValidatedEmail("comm@ciblorgasport.local", "John");
        verify(notificationService).createSystemNotification(
                eq(commissionner),
                eq(NotificationType.ACCREDITATION_VALIDATED),
                anyString(),
                anyString(),
                anyString()
        );
        verify(commissionnerRepository).save(commissionner);
    }

    @Test
    void validateAccreditation_WhenInvalid_ShouldSetFalseDeleteDocAndNotify() {
        commissionner.setAccreditationDocument(document);
        when(commissionnerRepository.findById(1L)).thenReturn(Optional.of(commissionner));

        accreditationService.validateAccreditation(1L, false, "Document illisible");

        assertFalse(commissionner.isAccredited());
        verify(storageService).deleteFile(document);
        verify(emailService).sendAccreditationRefusedEmail("comm@ciblorgasport.local", "John", "Document illisible");
        verify(notificationService).createSystemNotification(
                eq(commissionner),
                eq(NotificationType.ACCREDITATION_REFUSED),
                anyString(),
                anyString(),
                anyString()
        );
        verify(commissionnerRepository).save(commissionner);
    }

    @Test
    void ensureAccredited_WhenAccredited_ShouldNotThrowException() {
        commissionner.setAccredited(true);
        when(commissionnerRepository.findByEmail("comm@ciblorgasport.local")).thenReturn(Optional.of(commissionner));

        accreditationService.ensureAccredited("comm@ciblorgasport.local");
    }

    @Test
    void ensureAccredited_WhenNotAccredited_ShouldThrowAccessDeniedException() {
        commissionner.setAccredited(false);
        when(commissionnerRepository.findByEmail("comm@ciblorgasport.local")).thenReturn(Optional.of(commissionner));

        assertThrows(org.springframework.security.access.AccessDeniedException.class, () -> {
            accreditationService.ensureAccredited("comm@ciblorgasport.local");
        });
    }
}
