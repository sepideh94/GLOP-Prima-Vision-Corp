package com.ciblorgasport.commissionner;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ciblorgasport.storage.application.StorageService;
import com.ciblorgasport.storage.domain.Document;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommissionnerAccreditationService {

    private final CommissionerRepository commissionnerRepository;
    private final StorageService storageService;


    @Transactional
    public void uploadAccreditationForCurrentUser(String email, MultipartFile file) {
        Commissionner commissionner = commissionnerRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Profil commissaire introuvable pour : " + email));

        if (commissionner.getAccreditationDocument() != null) {
            storageService.deleteFile(commissionner.getAccreditationDocument());
        }

        String keyPrefix = "commissionners/" + commissionner.getId() + "/accreditation-cen";
        Document document = storageService.uploadFile(keyPrefix, file);

        commissionner.setAccreditationDocument(document);
        commissionner.setAccredited(false); 
        commissionnerRepository.save(commissionner);
    }

    public byte[] downloadMyAccreditation(String email) {
        Commissionner commissionner = commissionnerRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Profil commissaire introuvable"));

        if (commissionner.getAccreditationDocument() == null) {
            throw new EntityNotFoundException("Aucun document d'accréditation trouvé");
        }

        return storageService.downloadFile(commissionner.getAccreditationDocument());
    }

    public String getMyAccreditationContentType(String email) {
        Commissionner commissionner = commissionnerRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Profil commissaire introuvable"));

        return commissionner.getAccreditationDocument().getContentType();
    }

    // --- LOGIQUE POUR L'ADMIN (MARIUS) ---
    
    public byte[] downloadAccreditationById(Long commissionnerId) {
        Commissionner commissionner = commissionnerRepository.findById(commissionnerId)
                .orElseThrow(() -> new EntityNotFoundException("Commissaire introuvable"));

        if (commissionner.getAccreditationDocument() == null) {
            throw new EntityNotFoundException("Aucun document d'accréditation trouvé pour ce commissaire");
        }

        return storageService.downloadFile(commissionner.getAccreditationDocument());
    }

    public String getAccreditationContentTypeById(Long commissionnerId) {
        Commissionner commissionner = commissionnerRepository.findById(commissionnerId)
                .orElseThrow(() -> new EntityNotFoundException("Commissaire introuvable"));
        
        if (commissionner.getAccreditationDocument() == null) {
            throw new EntityNotFoundException("Aucun document d'accréditation trouvé pour ce commissaire");
        }

        return commissionner.getAccreditationDocument().getContentType();
    }

    // --- LOGIQUE POUR L'ADMIN (MARIUS) ---

    @Transactional
    public void validateAccreditation(Long commissionnerId, boolean isValid) {
        Commissionner commissionner = commissionnerRepository.findById(commissionnerId)
                .orElseThrow(() -> new EntityNotFoundException("Commissaire introuvable"));

        commissionner.setAccredited(isValid);
        commissionnerRepository.save(commissionner);
    }

    public void ensureAccredited(String email) {
        Commissionner commissionner = commissionnerRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Profil commissaire introuvable pour : " + email));
        
        if (!commissionner.isAccredited()) {
            throw new org.springframework.security.access.AccessDeniedException("Accès refusé : votre accréditation CEN doit être validée par un administrateur pour effectuer cette action.");
        }
    }
}