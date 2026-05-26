package com.northpay.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.northpay.backend.dto.request.ReviewDocumentRequest;
import com.northpay.backend.model.OnboardingRequest;
import com.northpay.backend.security.JwtUtil;
import com.northpay.backend.service.RequestService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RequestController.class)
class RequestControllerTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper mapper;

    @MockBean
    RequestService requestService;

    @MockBean
    JwtUtil jwtUtil;

    @Test
    @WithMockUser(roles = "WORKER")
    void listRequests_returns200() throws Exception {
        OnboardingRequest req = new OnboardingRequest();
        req.setId("request-1");
        req.setStatus("PENDING");

        when(requestService.findAll()).thenReturn(List.of(req));

        mvc.perform(get("/api/worker/requests"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value("request-1"));
    }

    @Test
    @WithMockUser(roles = "WORKER")
    void listRequests_byStatus_returns200() throws Exception {
        when(requestService.findByStatus("PENDING")).thenReturn(List.of());

        mvc.perform(get("/api/worker/requests?status=PENDING"))
            .andExpect(status().isOk());
    }

    @Test
    void listRequests_unauthenticated_returns401() throws Exception {
        mvc.perform(get("/api/worker/requests"))
            .andExpect(status().isUnauthorized());
    }
}
