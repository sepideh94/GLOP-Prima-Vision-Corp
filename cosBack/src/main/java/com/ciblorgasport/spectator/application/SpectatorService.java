package com.ciblorgasport.spectator.application;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ciblorgasport.spectator.domain.Spectator;
import com.ciblorgasport.spectator.dto.SpectatorTicketResponse;
import com.ciblorgasport.spectator.infrastructure.SpectatorRepository;
import com.ciblorgasport.storage.application.StorageService;
import com.ciblorgasport.storage.domain.Document;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SpectatorService {

    private final SpectatorRepository spectatorRepository;
    private final StorageService storageService;

    @Transactional
    public void uploadTicket(Long spectatorId, MultipartFile file) {
        Spectator spectator = spectatorRepository.findById(spectatorId)
                .orElseThrow(() -> new EntityNotFoundException("Spectateur introuvable"));

        String keyPrefix = "spectators/" + spectatorId + "/tickets";
        Document document = storageService.uploadFile(keyPrefix, file);

        spectator.getTicketDocuments().add(document);
        spectator.setTicketDocument(document);
        spectatorRepository.save(spectator);
    }

    public byte[] downloadTicket(Long spectatorId) {
        Spectator spectator = spectatorRepository.findById(spectatorId)
                .orElseThrow(() -> new EntityNotFoundException("Spectateur introuvable"));

        Document activeTicket = resolveActiveTicket(spectator);
        if (activeTicket == null) {
            throw new EntityNotFoundException("Aucun billet trouvé");
        }

        return storageService.downloadFile(activeTicket);
    }

    public String getTicketContentType(Long spectatorId) {
        Spectator spectator = spectatorRepository.findById(spectatorId)
                .orElseThrow(() -> new EntityNotFoundException("Spectateur introuvable"));

        Document activeTicket = resolveActiveTicket(spectator);
        if (activeTicket == null) {
            throw new EntityNotFoundException("Aucun billet trouvé");
        }

        return activeTicket.getContentType();
    }

    @Transactional
    public void deleteTicket(Long spectatorId) {
        Spectator spectator = spectatorRepository.findById(spectatorId)
                .orElseThrow(() -> new EntityNotFoundException("Spectateur introuvable"));

        Document activeTicket = resolveActiveTicket(spectator);
        if (activeTicket == null) {
            throw new EntityNotFoundException("Aucun billet trouvé");
        }

        storageService.deleteFile(activeTicket);
        spectator.getTicketDocuments().removeIf(d -> d.getId().equals(activeTicket.getId()));
        spectator.setTicketDocument(getMostRecentTicket(spectator));
        spectatorRepository.save(spectator);
    }

    public List<SpectatorTicketResponse> getTickets(Long spectatorId) {
        Spectator spectator = spectatorRepository.findById(spectatorId)
                .orElseThrow(() -> new EntityNotFoundException("Spectateur introuvable"));

        Document activeTicket = resolveActiveTicket(spectator);
        Long activeId = activeTicket != null ? activeTicket.getId() : null;

        return spectator.getTicketDocuments().stream()
                .sorted(Comparator.comparing(Document::getUploadedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(d -> SpectatorTicketResponse.builder()
                        .id(d.getId())
                        .fileName(d.getFileName())
                        .contentType(d.getContentType())
                        .fileSize(d.getFileSize())
                        .uploadedAt(d.getUploadedAt())
                        .active(activeId != null && activeId.equals(d.getId()))
                        .build())
                .toList();
    }

    public byte[] downloadTicketById(Long spectatorId, Long ticketId) {
        Spectator spectator = spectatorRepository.findById(spectatorId)
                .orElseThrow(() -> new EntityNotFoundException("Spectateur introuvable"));
        Document document = findTicketById(spectator, ticketId);
        return storageService.downloadFile(document);
    }

    public String getTicketContentTypeById(Long spectatorId, Long ticketId) {
        Spectator spectator = spectatorRepository.findById(spectatorId)
                .orElseThrow(() -> new EntityNotFoundException("Spectateur introuvable"));
        Document document = findTicketById(spectator, ticketId);
        return document.getContentType();
    }

    @Transactional
    public void deleteTicketById(Long spectatorId, Long ticketId) {
        Spectator spectator = spectatorRepository.findById(spectatorId)
                .orElseThrow(() -> new EntityNotFoundException("Spectateur introuvable"));
        Document document = findTicketById(spectator, ticketId);
        storageService.deleteFile(document);
        spectator.getTicketDocuments().removeIf(d -> d.getId().equals(ticketId));
        if (spectator.getTicketDocument() != null && spectator.getTicketDocument().getId().equals(ticketId)) {
            spectator.setTicketDocument(getMostRecentTicket(spectator));
        }
        spectatorRepository.save(spectator);
    }

    private Document findTicketById(Spectator spectator, Long ticketId) {
        return spectator.getTicketDocuments().stream()
                .filter(d -> d.getId().equals(ticketId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Billet introuvable"));
    }

    private Document getMostRecentTicket(Spectator spectator) {
        return spectator.getTicketDocuments().stream()
                .max(Comparator.comparing(Document::getUploadedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                .orElse(null);
    }

    private Document resolveActiveTicket(Spectator spectator) {
        if (spectator.getTicketDocument() != null) {
            return spectator.getTicketDocument();
        }
        return getMostRecentTicket(spectator);
    }
}