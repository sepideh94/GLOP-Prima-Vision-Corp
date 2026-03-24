package com.ciblorgasport.trial.api;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import jakarta.persistence.EntityNotFoundException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.ciblorgasport.common.exception.GlobalExceptionHandler;
import com.ciblorgasport.security.JwtAuthenticationFilter;
import com.ciblorgasport.security.config.SecurityConfig;
import com.ciblorgasport.security.services.JwtService;
import com.ciblorgasport.trial.application.TrialParticipantService;
import com.ciblorgasport.user.application.UserAccountService;
import com.ciblorgasport.user.domain.UserAccount;

@WebMvcTest(controllers = AthleteTrialParticipationController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import({ 
    SecurityConfig.class, 
    GlobalExceptionHandler.class, 
    AthleteTrialParticipationControllerIT.SecurityTestConfig.class 
})
class AthleteTrialParticipationControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TrialParticipantService trialParticipantService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @TestConfiguration
    static class SecurityTestConfig implements WebMvcConfigurer {
        @Bean
        public UserAccountService userAccountService() {
            UserAccountService mockService = mock(UserAccountService.class);
            UserDetailsService mockUserDetailsService = mock(UserDetailsService.class);
            when(mockService.userDetailsService()).thenReturn(mockUserDetailsService);
            return mockService;
        }

        @Override
        public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
            resolvers.add(new HandlerMethodArgumentResolver() {
                @Override
                public boolean supportsParameter(org.springframework.core.MethodParameter parameter) {
                    return parameter.getParameterType().equals(UserAccount.class);
                }

                @Override
                public Object resolveArgument(org.springframework.core.MethodParameter parameter,
                                             org.springframework.web.method.support.ModelAndViewContainer mavContainer,
                                             org.springframework.web.context.request.NativeWebRequest webRequest,
                                             org.springframework.web.bind.support.WebDataBinderFactory binderFactory) {
                    UserAccount mockUser = mock(UserAccount.class);
                    when(mockUser.getId()).thenReturn(13L);
                    return mockUser;
                }
            });
        }
    }

    @Autowired
    private UserAccountService userAccountService;

    @Test
    void shouldDeclareForfeitSuccessfully() throws Exception {
        doNothing().when(trialParticipantService).declareForfeit(4L, 13L);

        mockMvc.perform(post("/api/athlete/trials/4/forfeit"))
                .andExpect(status().isOk());

        verify(trialParticipantService).declareForfeit(4L, 13L);
    }

    @Test
    void shouldReturnNotFoundWhenTrialParticipantIsNotAccessible() throws Exception {
        doThrow(new EntityNotFoundException("Participation introuvable"))
                .when(trialParticipantService)
                .declareForfeit(4L, 13L);

        mockMvc.perform(post("/api/athlete/trials/4/forfeit"))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldReturnBadRequestWhenIllegalStateOccurs() throws Exception {
        doThrow(new IllegalStateException("L'épreuve a déjà commencé."))
                .when(trialParticipantService)
                .declareForfeit(4L, 13L);

        mockMvc.perform(post("/api/athlete/trials/4/forfeit"))
                .andExpect(status().isBadRequest());
    }
}