package com.ciblorgasport.spectator.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import com.ciblorgasport.spectator.domain.Spectator;
import com.ciblorgasport.spectator.infrastructure.SpectatorRepository;
import com.ciblorgasport.storage.application.StorageService;
import com.ciblorgasport.storage.domain.Document;

import jakarta.persistence.EntityNotFoundException;

@ExtendWith(MockitoExtension.class)
class SpectatorServiceTest {

    @Mock
    private SpectatorRepository spectatorRepository;
    @Mock
    private StorageService storageService;
    @InjectMocks
    private SpectatorService spectatorService;

    @Test
    void shouldUploadAndSetActiveTicket() {
        Spectator spectator = baseSpectator();
        MultipartFile file = org.mockito.Mockito.mock(MultipartFile.class);
        Document uploaded = ticket(10L, "ticket.pdf", LocalDateTime.now());
        when(spectatorRepository.findById(5L)).thenReturn(Optional.of(spectator));
        when(storageService.uploadFile("spectators/5/tickets", file)).thenReturn(uploaded);

        spectatorService.uploadTicket(5L, file);

        assertThat(spectator.getTicketDocument()).isEqualTo(uploaded);
        assertThat(spectator.getTicketDocuments()).contains(uploaded);
        verify(spectatorRepository).save(spectator);
    }

    @Test
    void shouldDownloadActiveTicketContent() {
        Spectator spectator = baseSpectator();
        Document active = ticket(11L, "active.pdf", LocalDateTime.now());
        spectator.setTicketDocument(active);
        spectator.setTicketDocuments(new ArrayList<>(List.of(active)));
        when(spectatorRepository.findById(2L)).thenReturn(Optional.of(spectator));
        when(storageService.downloadFile(active)).thenReturn(new byte[] {1, 2, 3});

        byte[] content = spectatorService.downloadTicket(2L);

        assertThat(content).containsExactly(1, 2, 3);
    }

    @Test
    void shouldFailWhenNoTicketExists() {
        Spectator spectator = baseSpectator();
        when(spectatorRepository.findById(3L)).thenReturn(Optional.of(spectator));

        assertThatThrownBy(() -> spectatorService.downloadTicket(3L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Aucun billet");
    }

    @Test
    void shouldDeleteSpecificTicketAndPromoteNewestWhenActiveDeleted() {
        Spectator spectator = baseSpectator();
        Document oldOne = ticket(1L, "old.pdf", LocalDateTime.now().minusDays(1));
        Document newest = ticket(2L, "new.pdf", LocalDateTime.now());
        spectator.setTicketDocuments(new ArrayList<>(List.of(oldOne, newest)));
        spectator.setTicketDocument(oldOne);
        when(spectatorRepository.findById(7L)).thenReturn(Optional.of(spectator));

        spectatorService.deleteTicketById(7L, 1L);

        verify(storageService).deleteFile(oldOne);
        assertThat(spectator.getTicketDocuments()).extracting(Document::getId).containsExactly(2L);
        assertThat(spectator.getTicketDocument().getId()).isEqualTo(2L);
        verify(spectatorRepository).save(spectator);
    }

    @Test
    void shouldReturnTicketsSortedByDateAndActiveFlag() {
        Spectator spectator = baseSpectator();
        Document oldest = ticket(1L, "a.pdf", LocalDateTime.now().minusDays(2));
        Document latest = ticket(2L, "b.pdf", LocalDateTime.now());
        spectator.setTicketDocuments(new ArrayList<>(List.of(oldest, latest)));
        spectator.setTicketDocument(oldest);
        when(spectatorRepository.findById(9L)).thenReturn(Optional.of(spectator));

        var result = spectatorService.getTickets(9L);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getId()).isEqualTo(2L);
        assertThat(result.get(0).isActive()).isFalse();
        assertThat(result.get(1).getId()).isEqualTo(1L);
        assertThat(result.get(1).isActive()).isTrue();
    }

    @Test
    void shouldThrowWhenSpectatorNotFound() {
        when(spectatorRepository.findById(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> spectatorService.getTicketContentType(99L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Spectateur introuvable");
    }

    @Test
    void shouldReturnContentTypeOfMostRecentTicketWhenNoActiveTicket() {
        Spectator spectator = baseSpectator();
        Document oldOne = ticket(1L, "old.pdf", LocalDateTime.now().minusDays(1));
        Document newest = ticket(2L, "new.pdf", LocalDateTime.now());
        newest.setContentType("image/png");
        spectator.setTicketDocuments(new ArrayList<>(List.of(oldOne, newest)));
        spectator.setTicketDocument(null);
        when(spectatorRepository.findById(21L)).thenReturn(Optional.of(spectator));

        String contentType = spectatorService.getTicketContentType(21L);

        assertThat(contentType).isEqualTo("image/png");
    }

    @Test
    void shouldDeleteActiveTicketAndSelectMostRecentRemainingOne() {
        Spectator spectator = baseSpectator();
        Document oldest = ticket(1L, "a.pdf", LocalDateTime.now().minusDays(2));
        Document active = ticket(2L, "b.pdf", LocalDateTime.now().minusDays(1));
        Document newest = ticket(3L, "c.pdf", LocalDateTime.now());
        spectator.setTicketDocuments(new ArrayList<>(List.of(oldest, active, newest)));
        spectator.setTicketDocument(active);
        when(spectatorRepository.findById(30L)).thenReturn(Optional.of(spectator));

        spectatorService.deleteTicket(30L);

        verify(storageService).deleteFile(active);
        assertThat(spectator.getTicketDocuments()).extracting(Document::getId).containsExactly(1L, 3L);
        assertThat(spectator.getTicketDocument().getId()).isEqualTo(3L);
        verify(spectatorRepository).save(spectator);
    }

    @Test
    void shouldDownloadAndReadContentTypeByTicketId() {
        Spectator spectator = baseSpectator();
        Document doc = ticket(9L, "ticket.pdf", LocalDateTime.now());
        spectator.setTicketDocuments(new ArrayList<>(List.of(doc)));
        when(spectatorRepository.findById(40L)).thenReturn(Optional.of(spectator));
        when(storageService.downloadFile(doc)).thenReturn(new byte[] {7, 8});

        byte[] data = spectatorService.downloadTicketById(40L, 9L);
        String contentType = spectatorService.getTicketContentTypeById(40L, 9L);

        assertThat(data).containsExactly(7, 8);
        assertThat(contentType).isEqualTo("application/pdf");
    }

    private Spectator baseSpectator() {
        return Spectator.builder()
                .ticketDocuments(new ArrayList<>())
                .build();
    }

    private Document ticket(Long id, String name, LocalDateTime uploadedAt) {
        return Document.builder()
                .id(id)
                .fileName(name)
                .s3Key("s3/" + name)
                .bucketName("test")
                .contentType("application/pdf")
                .fileSize(128L)
                .uploadedAt(uploadedAt)
                .build();
    }
}
