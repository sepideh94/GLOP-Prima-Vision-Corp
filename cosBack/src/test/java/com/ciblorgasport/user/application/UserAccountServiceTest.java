package com.ciblorgasport.user.application;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.apache.commons.csv.CSVRecord;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.user.dto.CreateUserRequest;
import com.ciblorgasport.user.dto.UserResponse;
import com.ciblorgasport.user.infrastructure.UserAccountRepository;

@ExtendWith(MockitoExtension.class)
class UserAccountServiceTest {

    @Mock
    private UserAccountRepository userRepo;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserAccountService userAccountService;

    private UserAccount user;

    @BeforeEach
    void setUp() {
        user = new UserAccount() {
            @Override
            public String getRoleName() {
                return "ROLE_ATHLETE";
            }
        };
        user.setId(1L);
        user.setEmail("test@email.com");
        user.setPassword("encodedPassword");
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setActive(true);
    }

    @Test
    void save_WhenNewUser_ShouldNormalizeEmailAndSave() {
        UserAccount newUser = new UserAccount() {
            @Override
            public String getRoleName() { return "ROLE_USER"; }
        };
        newUser.setEmail("  NEW@email.com  ");

        when(userRepo.findByEmail("new@email.com")).thenReturn(Optional.empty());
        when(userRepo.save(newUser)).thenReturn(newUser);

        UserAccount saved = userAccountService.save(newUser);

        assertEquals("new@email.com", saved.getEmail());
        verify(userRepo).save(newUser);
    }

    @Test
    void save_WhenEmailExists_ShouldThrowException() {
        when(userRepo.findByEmail("test@email.com")).thenReturn(Optional.of(user));

        UserAccount newUser = new UserAccount() {
            @Override
            public String getRoleName() { return "ROLE_USER"; }
        };
        newUser.setEmail("test@email.com");

        assertThrows(IllegalArgumentException.class, () -> userAccountService.save(newUser));
        verify(userRepo, never()).save(any());
    }

    @Test
    void loadUserByUsername_WhenExists_ShouldReturnUserDetails() {
        when(userRepo.findByEmail("test@email.com")).thenReturn(Optional.of(user));

        UserDetails details = userAccountService.loadUserByUsername(" TEST@email.com ");

        assertNotNull(details);
        assertEquals(user.getEmail(), details.getUsername());
    }

    @Test
    void loadUserByUsername_WhenNotExists_ShouldThrowException() {
        when(userRepo.findByEmail("notfound@email.com")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> userAccountService.loadUserByUsername("notfound@email.com"));
    }

    @Test
    void changePassword_WhenValid_ShouldUpdatePassword() {
        when(userRepo.findByEmail("test@email.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("oldPass", "encodedPassword")).thenReturn(true);
        when(passwordEncoder.encode("newPass")).thenReturn("newEncoded");

        userAccountService.changePassword("test@email.com", "oldPass", "newPass");

        assertEquals("newEncoded", user.getPassword());
        verify(userRepo).save(user);
    }

    @Test
    void changePassword_WhenWrongOldPassword_ShouldThrowException() {
        when(userRepo.findByEmail("test@email.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPass", "encodedPassword")).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> 
            userAccountService.changePassword("test@email.com", "wrongPass", "newPass")
        );

        verify(userRepo, never()).save(any());
    }

    @Test
    void getAllUsersForAdmin_ShouldReturnMappedResponses() {
        when(userRepo.findAll()).thenReturn(List.of(user));

        List<UserResponse> responses = userAccountService.getAllUsersForAdmin();

        assertEquals(1, responses.size());
        assertEquals(1L, responses.get(0).getId());
        assertEquals("test@email.com", responses.get(0).getEmail());
        assertEquals("ATHLETE", responses.get(0).getRole());
    }

    @Test
    void getUserByIdForAdmin_WhenFound_ShouldReturnMappedResponse() {
        when(userRepo.findById(1L)).thenReturn(Optional.of(user));

        UserResponse response = userAccountService.getUserByIdForAdmin(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("ATHLETE", response.getRole());
    }

    @Test
    void setUserActive_ShouldUpdateActiveStatus() {
        when(userRepo.findById(1L)).thenReturn(Optional.of(user));

        userAccountService.setUserActive(1L, false);

        assertFalse(user.isActive());
        verify(userRepo).save(user);
    }

    @Test
    void resetUserPasswordByAdmin_ShouldGenerateAndSetNewPassword() {
        when(userRepo.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode(anyString())).thenReturn("tempEncoded");

        String tempPass = userAccountService.resetUserPasswordByAdmin(1L);

        assertNotNull(tempPass);
        assertEquals(8, tempPass.length());
        assertEquals("tempEncoded", user.getPassword());
        verify(userRepo).save(user);
    }

    @Test
    void createAndInviteUser_WhenNewUser_ShouldCreate() {
        when(userRepo.findByEmail("new@test.com")).thenReturn(Optional.empty());
        
        CSVRecord record = mock(CSVRecord.class);
        when(record.get("email")).thenReturn("new@test.com");
        when(record.get("firstName")).thenReturn("Bob");
        when(record.get("lastName")).thenReturn("Marley");

        UserCreationService creationService = mock(UserCreationService.class);

        userAccountService.createAndInviteUser(record, creationService);

        verify(creationService).createUser(any(CreateUserRequest.class));
    }
}
