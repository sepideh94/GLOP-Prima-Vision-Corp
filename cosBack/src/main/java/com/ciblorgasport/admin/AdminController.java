package com.ciblorgasport.admin;

import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import static org.springframework.http.HttpHeaders.CONTENT_DISPOSITION;

import com.ciblorgasport.admin.dto.AdminStatsResponse;
import com.ciblorgasport.admin.dto.ExportReportRequest;
import com.ciblorgasport.analytics.application.AnalyticsService;
import com.ciblorgasport.analytics.application.PdfGeneratorService;
import com.ciblorgasport.analytics.dto.SectionVisitCount;
import com.ciblorgasport.commissionner.CommissionnerCreationService;
import com.ciblorgasport.user.application.UserAccountService;
import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.user.dto.CreateCommissionnerRequest;
import com.ciblorgasport.user.dto.CreateUserRequest;
import com.ciblorgasport.user.dto.UserResponse;
import com.ciblorgasport.volonteer.application.VolonteerCreationService;
import com.ciblorgasport.volonteer.application.VolonteerImportService;
import com.ciblorgasport.volonteer.domain.Volonteer;
import com.ciblorgasport.volonteer.domain.VolonteerCompetitionResponse;

import lombok.RequiredArgsConstructor;
import com.ciblorgasport.commissionner.CommissionnerAccreditationService;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    @Autowired
    private final CommissionnerCreationService commissionnerService;

    @Autowired
    private final CommissionnerAccreditationService accreditationService;

    @Autowired
    private final UserAccountService userAccountService;

    @Autowired
    private final VolonteerImportService volonteerImportService;

    @Autowired
    private final VolonteerCreationService volonteerCreationService;
    
    @Autowired
    private final AnalyticsService analyticsService;
    
    @Autowired
    private final PdfGeneratorService pdfGeneratorService;
    

    @PostMapping("/create-commissaire")
    public ResponseEntity<?> createCommissaire(@RequestBody CreateCommissionnerRequest request) {
        var created = commissionnerService.createUser(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                        "id", created.getId(),
                        "email", created.getEmail(),
                        "role", created.getRoleName().replace("ROLE_", "")));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userAccountService.getAllUsersForAdmin());
    }

    // ==================== Volontaires ====================

    /**
     * Importe des volontaires via un fichier CSV pour une compétition.
     */
    @PostMapping("/competitions/{competitionId}/import-volonteers")
    public ResponseEntity<VolonteerImportService.ImportResult> importVolonteers(@PathVariable Long competitionId,
            @RequestParam("file") MultipartFile file) throws Exception {

        return ResponseEntity.ok(volonteerImportService.importVolonteersForCompetition(file, competitionId));
    }

    /**
     * Création manuelle d'un volontaire.
     * Le service se chargera d'envoyer le mail d'invitation automatiquement.
     */
    @PostMapping("/competitions/{competitionId}/create-volonteer")
    public ResponseEntity<UserAccount> createVolonteerManual(@PathVariable Long competitionId,
            @RequestBody CreateUserRequest request) {

        Volonteer volonteer = (Volonteer) volonteerCreationService.createUser(request);

        volonteerImportService.inviteToCompetition(volonteer, competitionId);

        return ResponseEntity.status(HttpStatus.CREATED).body(volonteer);
    }

    /**
     * Récupère la liste des volontaires d'une compétition avec leur statut.
     */
    @GetMapping("/competitions/{competitionId}/volonteers")
    public ResponseEntity<List<VolonteerCompetitionResponse>> getVolonteersByCompetition(
            @PathVariable Long competitionId) {

        List<VolonteerCompetitionResponse> volonteers = volonteerImportService
                .getVolonteersByCompetition(competitionId);
        return ResponseEntity.ok(volonteers);
    }

    @GetMapping("/events/{eventId}/volonteers")
    public ResponseEntity<List<VolonteerCompetitionResponse>> getVolonteersByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(volonteerImportService.getAllVolonteersByEvent(eventId));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userAccountService.getUserByIdForAdmin(id));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<Void> toggleUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        Boolean enabled = body != null ? body.get("enabled") : null;
        if (enabled == null) {
            return ResponseEntity.badRequest().build();
        }
        userAccountService.setUserActive(id, enabled);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users/{id}/reset-password")
    public ResponseEntity<Map<String, String>> resetUserPassword(@PathVariable Long id) {
        String tempPassword = userAccountService.resetUserPasswordByAdmin(id);
        return ResponseEntity.ok(Map.of(
                "message", "Mot de passe réinitialisé avec succès",
                "temporaryPassword", tempPassword));
    }

    // ==================== Accréditations Commissaires ====================

    @PostMapping("/commissioners/{id}/accreditation/validate")
    public ResponseEntity<Map<String, String>> validateAccreditation(@PathVariable("id") Long id) {
        accreditationService.validateAccreditation(id, true, null);
        return ResponseEntity.ok(Map.of("message", "Accréditation validée pour le commissaire " + id));
    }

    @PostMapping("/commissioners/{id}/accreditation/refuse")
    public ResponseEntity<Map<String, String>> refuseAccreditation(
            @PathVariable("id") Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = (body != null && body.containsKey("reason")) ? body.get("reason") : "Non spécifié";
        accreditationService.validateAccreditation(id, false, reason);
        return ResponseEntity.ok(Map.of("message", "Accréditation refusée pour le commissaire " + id));
    }

    @GetMapping("/commissioners/{id}/accreditation")
    public ResponseEntity<byte[]> downloadAccreditation(@PathVariable("id") Long id) {
        byte[] fileData = accreditationService.downloadAccreditationById(id);
        String contentType = accreditationService.getAccreditationContentTypeById(id);

        return ResponseEntity.ok()
                .header(CONTENT_DISPOSITION, "inline; filename=\"accreditation-" + id + "\"")
                .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                .body(fileData);
    }
    
    // ==================== Analytics ====================
    
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getDashboardStats(
            @RequestParam(defaultValue = "7") int days) {
        
        return ResponseEntity.ok(analyticsService.getDashboardStats(days));
    }
    

    @GetMapping("/report-summary")
    public ResponseEntity<String> getWeeklyReportSummary() {
        String summary = analyticsService.generateWeeklyReportSummary();
        
        return ResponseEntity.ok(summary);
    }
    
    @PostMapping("/report-download")
    public ResponseEntity<byte[]> downloadReport(@RequestBody(required = false) ExportReportRequest request) {
        
        // 1. Récupérer toutes les stats calculées
        AdminStatsResponse stats = analyticsService.getDashboardStats(7);
        
        // 2. Traiter les images si présentes
        List<byte[]> imageBytesList = new ArrayList<>();
        if (request != null && request.getChartImagesBase64() != null) {
            imageBytesList = request.getChartImagesBase64().stream()
                    .<byte[]>map((String base64) -> { 
                        String cleanBase64 = base64.contains(",") ? base64.split(",")[1] : base64;
                        return Base64.getDecoder().decode(cleanBase64);
                    })
                    .collect(Collectors.toList());
        }

        // 3. Générer le PDF avec l'objet stats complet
        byte[] pdfBytes = pdfGeneratorService.generatePdfReport(stats, imageBytesList);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "rapport_expert_ciblorgasport.pdf");

        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }
    
    @GetMapping("/stats/consultations")
    public ResponseEntity<List<SectionVisitCount>> getMostConsultedSections() {
        return ResponseEntity.ok(analyticsService.getMostConsultedSections());
    }

    @GetMapping("/stats/consultations-by-role")
    public ResponseEntity<List<SectionVisitCount>> getMostConsultedSectionsByRole(@RequestParam("role") String role) {
        return ResponseEntity.ok(analyticsService.getMostConsultedSectionsByRole(role));
    }
    

}
