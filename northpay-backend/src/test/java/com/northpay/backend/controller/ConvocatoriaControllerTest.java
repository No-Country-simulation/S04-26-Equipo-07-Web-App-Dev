package com.northpay.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.northpay.backend.dto.convocatoria.ConvocatoriaRequest;
import com.northpay.backend.model.Convocatoria;
import com.northpay.backend.security.JwtUtil;
import com.northpay.backend.service.ConvocatoriaService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

@WebMvcTest(ConvocatoriaController.class)
@ActiveProfiles("test")
class ConvocatoriaControllerTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper mapper;

    @MockBean
    ConvocatoriaService convocatoriaService;

    @MockBean
    JwtUtil jwtUtil;

    @Test
    @WithMockUser(username = "user-1", roles = "USER")
    void createConvocatoria_valid_returns200() throws Exception {
        ConvocatoriaRequest req = new ConvocatoriaRequest();
        req.setCompanyId("company-1");
        req.setTitle("Dev Frontend");

        Convocatoria conv = new Convocatoria();
        conv.setId("conv-1");
        conv.setTitle("Dev Frontend");

        when(convocatoriaService.create(any(), any())).thenReturn(conv);

        mvc.perform(post("/api/convocatorias")
                .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(req))
            .with(csrf()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value("conv-1"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void listAll_returns200() throws Exception {
        when(convocatoriaService.findAll()).thenReturn(List.of());

        mvc.perform(get("/api/convocatorias"))
            .andExpect(status().isOk());
    }
}
