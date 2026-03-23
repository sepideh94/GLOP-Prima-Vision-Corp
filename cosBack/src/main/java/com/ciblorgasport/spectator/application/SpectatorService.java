package com.ciblorgasport.spectator.application;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ciblorgasport.spectator.domain.Spectator;
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

        if (spectator.getTicketDocument() != null) {
            storageService.deleteFile(spectator.getTicketDocument());
        }

        String keyPrefix = "spectators/" + spectatorId + "/ticket";
        Document document = storageService.uploadFile(keyPrefix, file);

        spectator.setTicketDocument(document);
        spectatorRepository.save(spectator);
    }

    public byte[] downloadTicket(Long spectatorId) {
        Spectator spectator = spectatorRepository.findById(spectatorId)
                .orElseThrow(() -> new EntityNotFoundException("Spectateur introuvable"));

        if (spectator.getTicketDocument() == null) {
            throw new EntityNotFoundException("Aucun billet trouvé");
        }

        return storageService.downloadFile(spectator.getTicketDocument());
    }

    public String getTicketContentType(Long spectatorId) {
        Spectator spectator = spectatorRepository.findById(spectatorId)
                .orElseThrow(() -> new EntityNotFoundException("Spectateur introuvable"));

        if (spectator.getTicketDocument() == null) {
            throw new EntityNotFoundException("Aucun billet trouvé");
        }

        return spectator.getTicketDocument().getContentType();
    }

    @Transactional
    public void deleteTicket(Long spectatorId) {
        Spectator spectator = spectatorRepository.findById(spectatorId)
                .orElseThrow(() -> new EntityNotFoundException("Spectateur introuvable"));

        if (spectator.getTicketDocument() == null) {
            throw new EntityNotFoundException("Aucun billet trouvé");
        }

        storageService.deleteFile(spectator.getTicketDocument());
        spectator.setTicketDocument(null);
        spectatorRepository.save(spectator);
    }
}