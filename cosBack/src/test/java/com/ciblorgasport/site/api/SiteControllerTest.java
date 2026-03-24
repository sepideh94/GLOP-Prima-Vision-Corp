package com.ciblorgasport.site.api;

import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.ciblorgasport.config.SecurityDisabledConfig;
import com.ciblorgasport.security.services.JwtService;
import com.ciblorgasport.site.application.SiteService;
import com.ciblorgasport.site.dto.SiteResponse;
import com.ciblorgasport.user.application.UserAccountService;

@WebMvcTest(SiteController.class)
@org.springframework.test.context.ActiveProfiles("test")
@Import(SecurityDisabledConfig.class)
@DisplayName("SiteController")
class SiteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean private SiteService siteService;
    @MockitoBean private JwtService jwtService;
    @MockitoBean private UserAccountService userAccountService;

    @Test
    void create_shouldReturn201() throws Exception {
        given(siteService.create(org.mockito.ArgumentMatchers.any()))
                .willReturn(SiteResponse.builder().id(1L).adress("Paris").latitude(48.8).longitude(2.3).build());

        mockMvc.perform(post("/api/admin/sites")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"adress\":\"Paris\",\"latitude\":48.8,\"longitude\":2.3}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.adress").value("Paris"));
    }

    @Test
    void update_get_list_delete_shouldWork() throws Exception {
        given(siteService.update(org.mockito.ArgumentMatchers.eq(1L), org.mockito.ArgumentMatchers.any()))
                .willReturn(SiteResponse.builder().id(1L).adress("Lyon").latitude(45.7).longitude(4.8).build());
        given(siteService.getById(1L))
                .willReturn(SiteResponse.builder().id(1L).adress("Lyon").latitude(45.7).longitude(4.8).build());
        given(siteService.getAll())
                .willReturn(List.of(SiteResponse.builder().id(1L).adress("Lyon").latitude(45.7).longitude(4.8).build()));

        mockMvc.perform(put("/api/admin/sites/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"adress\":\"Lyon\",\"latitude\":45.7,\"longitude\":4.8}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.adress").value("Lyon"));

        mockMvc.perform(get("/api/admin/sites/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));

        mockMvc.perform(get("/api/admin/sites"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        mockMvc.perform(delete("/api/admin/sites/1"))
                .andExpect(status().isNoContent());
        verify(siteService).delete(1L);
    }
}
