package com.ciblorgasport.trial.round.api;

import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
import com.ciblorgasport.trial.round.application.RoundService;
import com.ciblorgasport.trial.round.domain.RoundName;
import com.ciblorgasport.trial.round.dto.RoundResponse;
import com.ciblorgasport.user.application.UserAccountService;

@WebMvcTest(RoundController.class)
@Import(SecurityDisabledConfig.class)
@DisplayName("RoundController")
class RoundControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean private RoundService roundService;
    @MockitoBean private JwtService jwtService;
    @MockitoBean private UserAccountService userAccountService;

    @Test
    void create_shouldReturn201() throws Exception {
        given(roundService.create(org.mockito.ArgumentMatchers.any()))
                .willReturn(RoundResponse.builder().id(1L).name(RoundName.FINALE).orderNumber(5).displayName("Finale").build());

        mockMvc.perform(post("/api/rounds")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"FINALE\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("FINALE"));
    }

    @Test
    void getAll_getById_delete_shouldWork() throws Exception {
        given(roundService.getAll())
                .willReturn(List.of(RoundResponse.builder().id(1L).name(RoundName.FINALE).orderNumber(5).displayName("Finale").build()));
        given(roundService.getById(1L))
                .willReturn(RoundResponse.builder().id(1L).name(RoundName.FINALE).orderNumber(5).displayName("Finale").build());

        mockMvc.perform(get("/api/rounds"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        mockMvc.perform(get("/api/rounds/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName").value("Finale"));

        mockMvc.perform(delete("/api/rounds/1"))
                .andExpect(status().isNoContent());
        verify(roundService).delete(1L);
    }
}
