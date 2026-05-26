package com.northpay.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.northpay.backend.dto.invitation.InvitationRequest;
import com.northpay.backend.model.Invitation;
import com.northpay.backend.security.JwtUtil;
import com.northpay.backend.service.InvitationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(InvitationController.class)
class InvitationControllerTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper mapper;

    @MockBean
    InvitationService invitationService;

    @MockBean
    JwtUtil jwtUtil;

    @Test
    @WithMockUser(roles = "WORKER")
    void sendInvitation_valid_returns200() throws Exception {
        InvitationRequest req = new InvitationRequest();
        req.setEmail("newuser@test.com");

        Invitation inv = new Invitation();
        inv.setEmail("newuser@test.com");
        inv.setToken("generated-token");

        when(invitationService.sendInvitation(any(), any())).thenReturn(inv);

        mvc.perform(post("/api/worker/invitations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
            .andExpect(status().isOk());
    }

    @Test
    void sendInvitation_unauthenticated_returns401() throws Exception {
        InvitationRequest req = new InvitationRequest();
        req.setEmail("newuser@test.com");

        mvc.perform(post("/api/worker/invitations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
            .andExpect(status().isUnauthorized());
    }
}
