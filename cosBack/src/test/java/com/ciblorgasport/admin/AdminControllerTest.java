package com.ciblorgasport.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;

import com.ciblorgasport.commissionner.Commissionner;
import com.ciblorgasport.commissionner.CommissionnerAccreditationService;
import com.ciblorgasport.commissionner.CommissionnerCreationService;
import com.ciblorgasport.user.application.UserAccountService;
import com.ciblorgasport.user.dto.CreateCommissionnerRequest;
import com.ciblorgasport.user.dto.CreateUserRequest;
import com.ciblorgasport.user.dto.UserResponse;
import com.ciblorgasport.analytics.application.AnalyticsService;
import com.ciblorgasport.analytics.application.PdfGeneratorService;
import com.ciblorgasport.volonteer.application.VolonteerCreationService;
import com.ciblorgasport.volonteer.application.VolonteerImportService;
import com.ciblorgasport.volonteer.domain.Volonteer;
import com.ciblorgasport.volonteer.domain.VolonteerCompetitionResponse;

class AdminControllerTest {

    private CommissionnerCreationService commissionnerService;
    private CommissionnerAccreditationService accreditationService;
    private UserAccountService userAccountService;
    private VolonteerImportService volonteerImportService;
    private VolonteerCreationService volonteerCreationService;
    private AnalyticsService analyticsService;
    private PdfGeneratorService pdfGeneratorService;
    private AdminController controller;

    @BeforeEach
    void setUp() {
        commissionnerService = org.mockito.Mockito.mock(CommissionnerCreationService.class);
        accreditationService = org.mockito.Mockito.mock(CommissionnerAccreditationService.class);
        userAccountService = org.mockito.Mockito.mock(UserAccountService.class);
        volonteerImportService = org.mockito.Mockito.mock(VolonteerImportService.class);
        volonteerCreationService = org.mockito.Mockito.mock(VolonteerCreationService.class);
        analyticsService = org.mockito.Mockito.mock(AnalyticsService.class);
        pdfGeneratorService = org.mockito.Mockito.mock(PdfGeneratorService.class);
        controller = new AdminController(
                commissionnerService,
                accreditationService,
                userAccountService,
                volonteerImportService,
                volonteerCreationService,
                analyticsService,
                pdfGeneratorService
        );
    }

    @Test
    void shouldCreateCommissionerAndListUsers() {
        Commissionner created = new Commissionner();
        created.setId(5L);
        created.setEmail("comm@test.com");
        when(commissionnerService.createUser(any(CreateCommissionnerRequest.class))).thenReturn(created);
        when(userAccountService.getAllUsersForAdmin())
                .thenReturn(List.of(UserResponse.builder().id(1L).email("u@test.com").build()));

        var createResponse = controller.createCommissaire(CreateCommissionnerRequest.builder().email("comm@test.com").build());
        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(createResponse.getBody()).isInstanceOf(Map.class);

        var users = controller.getAllUsers();
        assertThat(users.getBody()).hasSize(1);
    }

    @Test
    void shouldManageVolonteersAndUserStatus() throws Exception {
        when(volonteerImportService.importVolonteersForCompetition(any(), any()))
                .thenReturn(new VolonteerImportService.ImportResult(10, 3));
        when(volonteerImportService.getVolonteersByCompetition(1L)).thenReturn(List.of());
        when(volonteerImportService.getAllVolonteersByEvent(2L)).thenReturn(List.of());
        when(userAccountService.resetUserPasswordByAdmin(3L)).thenReturn("temp-123");

        Volonteer volonteer = new Volonteer();
        volonteer.setId(9L);
        volonteer.setEmail("vol@test.com");
        when(volonteerCreationService.createUser(any(CreateUserRequest.class))).thenReturn(volonteer);

        var importRes = controller.importVolonteers(1L, new MockMultipartFile("file", "v.csv", "text/csv", "a,b".getBytes()));
        assertThat(importRes.getStatusCode()).isEqualTo(HttpStatus.OK);

        var createVol = controller.createVolonteerManual(1L, new CreateUserRequest());
        assertThat(createVol.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        verify(volonteerImportService).inviteToCompetition(volonteer, 1L);

        assertThat(controller.getVolonteersByCompetition(1L).getBody()).isEmpty();
        assertThat(controller.getVolonteersByEvent(2L).getBody()).isEmpty();

        assertThat(controller.toggleUserStatus(7L, null).getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(controller.toggleUserStatus(7L, Map.of("enabled", true)).getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(userAccountService).setUserActive(7L, true);

        assertThat(controller.resetUserPassword(3L).getBody()).containsEntry("temporaryPassword", "temp-123");
    }

    @Test
    void shouldHandleAccreditationFlows() {
        when(accreditationService.downloadAccreditationById(4L)).thenReturn("pdf".getBytes());
        when(accreditationService.getAccreditationContentTypeById(4L)).thenReturn("application/pdf");

        assertThat(controller.validateAccreditation(1L).getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(accreditationService).validateAccreditation(1L, true, null);

        assertThat(controller.refuseAccreditation(2L, null).getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(accreditationService).validateAccreditation(2L, false, "Non spécifié");

        assertThat(controller.refuseAccreditation(2L, Map.of("reason", "docs incomplets")).getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(accreditationService).validateAccreditation(2L, false, "docs incomplets");

        var download = controller.downloadAccreditation(4L);
        assertThat(download.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(download.getHeaders().getContentType().toString()).isEqualTo("application/pdf");
    }
}
