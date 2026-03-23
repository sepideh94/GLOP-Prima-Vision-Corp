package com.ciblorgasport.spectator.api;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ciblorgasport.spectator.application.SpectatorService;
import com.ciblorgasport.spectator.dto.SpectatorTicketResponse;
import com.ciblorgasport.user.domain.UserAccount;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/spectator/profile")
@RequiredArgsConstructor
public class SpectatorProfileController {

    private final SpectatorService spectatorService;

    @PostMapping("/ticket")
    public ResponseEntity<Void> uploadTicket(
            @AuthenticationPrincipal UserAccount user,
            @RequestParam("file") MultipartFile file) {
        spectatorService.uploadTicket(user.getId(), file);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/ticket")
    public ResponseEntity<byte[]> downloadTicket(@AuthenticationPrincipal UserAccount user) {
        byte[] data = spectatorService.downloadTicket(user.getId());
        String contentType = spectatorService.getTicketContentType(user.getId());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"ticket\"")
                .body(data);
    }

    @DeleteMapping("/ticket")
    public ResponseEntity<Void> deleteTicket(@AuthenticationPrincipal UserAccount user) {
        spectatorService.deleteTicket(user.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tickets")
    public ResponseEntity<List<SpectatorTicketResponse>> listTickets(@AuthenticationPrincipal UserAccount user) {
        return ResponseEntity.ok(spectatorService.getTickets(user.getId()));
    }

    @GetMapping("/tickets/{ticketId}")
    public ResponseEntity<byte[]> downloadTicketById(
            @AuthenticationPrincipal UserAccount user,
            @PathVariable Long ticketId) {
        byte[] data = spectatorService.downloadTicketById(user.getId(), ticketId);
        String contentType = spectatorService.getTicketContentTypeById(user.getId(), ticketId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"ticket-" + ticketId + "\"")
                .body(data);
    }

    @DeleteMapping("/tickets/{ticketId}")
    public ResponseEntity<Void> deleteTicketById(
            @AuthenticationPrincipal UserAccount user,
            @PathVariable Long ticketId) {
        spectatorService.deleteTicketById(user.getId(), ticketId);
        return ResponseEntity.noContent().build();
    }
}