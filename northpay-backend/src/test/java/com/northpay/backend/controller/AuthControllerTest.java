package com.northpay.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.northpay.backend.dto.auth.LoginRequest;
import com.northpay.backend.dto.auth.LoginResponse;
import com.northpay.backend.dto.auth.SetPasswordRequest;
import com.northpay.backend.model.Invitation;
import com.northpay.backend.service.AuthService;
import com.northpay.backend.service.InvitationService;
import com.northpay.backend.service.LogService;
import com.northpay.backend.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.ActiveProfiles;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

@WebMvcTest(AuthController.class)
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper mapper;

    @MockBean
    AuthService authService;

    @MockBean
    InvitationService invitationService;

    @MockBean
    LogService logService;

    @MockBean
    JwtUtil jwtUtil;

    @Test
    void login_validCredentials_returnsToken() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("user@test.com");
        req.setPassword("password123");

        LoginResponse resp = new LoginResponse("jwt-token", "user-1", "user@test.com", "John", "Doe", "user", 0.0);

        when(authService.login(anyString(), anyString())).thenReturn(resp);

        mvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(req))
            .with(csrf()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").value("jwt-token"));
    }

    @Test
    void login_blankEmail_returns400() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("");
        req.setPassword("password123");

        mvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(req))
            .with(csrf()))
            .andExpect(status().isBadRequest());
    }

    @Test
    void validateInvitation_validToken_returnsInvitation() throws Exception {
        Invitation inv = new Invitation();
        inv.setEmail("invited@test.com");
        inv.setToken("valid-token");

        when(invitationService.validateToken("valid-token")).thenReturn(inv);

        mvc.perform(get("/api/auth/invitation/validate?token=valid-token"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("invited@test.com"));
    }
}
