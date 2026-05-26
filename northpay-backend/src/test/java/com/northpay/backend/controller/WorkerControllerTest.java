package com.northpay.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.northpay.backend.dto.worker.CreateWorkerRequest;
import com.northpay.backend.model.Worker;
import com.northpay.backend.security.JwtUtil;
import com.northpay.backend.service.WorkerService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(WorkerController.class)
class WorkerControllerTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper mapper;

    @MockBean
    WorkerService workerService;

    @MockBean
    JwtUtil jwtUtil;

    @Test
    @WithMockUser(roles = "WORKER")
    void listWorkers_returns200() throws Exception {
        Worker w = new Worker();
        w.setId("worker-1");
        w.setEmail("worker@test.com");

        when(workerService.findAll()).thenReturn(List.of(w));

        mvc.perform(get("/api/worker/workers"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value("worker-1"));
    }

    @Test
    @WithMockUser(roles = "WORKER")
    void createWorker_valid_returns200() throws Exception {
        CreateWorkerRequest req = new CreateWorkerRequest();
        req.setFirstName("Ana");
        req.setLastName("Lopez");
        req.setEmail("ana@test.com");
        req.setPassword("Pass@1234");

        Worker w = new Worker();
        w.setId("worker-2");
        w.setEmail("ana@test.com");

        when(workerService.create(any())).thenReturn(w);

        mvc.perform(post("/api/worker/workers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value("worker-2"));
    }

    @Test
    void listWorkers_unauthenticated_returns401() throws Exception {
        mvc.perform(get("/api/worker/workers"))
            .andExpect(status().isUnauthorized());
    }
}
