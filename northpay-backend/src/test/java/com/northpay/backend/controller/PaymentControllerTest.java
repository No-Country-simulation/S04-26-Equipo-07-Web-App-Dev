package com.northpay.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.northpay.backend.dto.payment.CreatePaymentRequest;
import com.northpay.backend.model.Payment;
import com.northpay.backend.model.User;
import com.northpay.backend.repository.PaymentRepository;
import com.northpay.backend.repository.UserRepository;
import com.northpay.backend.security.JwtUtil;
import com.northpay.backend.service.StripeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

@WebMvcTest(PaymentController.class)
@ActiveProfiles("test")
class PaymentControllerTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper mapper;

    @MockBean
    StripeService stripeService;

    @MockBean
    UserRepository userRepository;

    @MockBean
    PaymentRepository paymentRepository;

    @MockBean
    JwtUtil jwtUtil;

    @Test
    @WithMockUser(username = "user-1", roles = "USER")
    void createPayment_valid_returnsClientSecret() throws Exception {
        CreatePaymentRequest req = new CreatePaymentRequest();
        req.setAmount(50.0);

        when(stripeService.createPaymentIntent(any(), anyDouble()))
            .thenReturn(Map.of("clientSecret", "pi_secret", "paymentId", "pay-1"));

        mvc.perform(post("/api/users/payments/create")
                .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(req))
            .with(csrf()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.clientSecret").value("pi_secret"));
    }

    @Test
    @WithMockUser(username = "user-1", roles = "USER")
    void getBalance_returns200() throws Exception {
        User user = new User();
        user.setCredits(100.0);

        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));

        mvc.perform(get("/api/users/balance"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.credits").value(100.0));
    }

    @Test
    @WithMockUser(username = "user-1", roles = "USER")
    void getPaymentHistory_returns200() throws Exception {
        Payment p = new Payment();
        p.setId("pay-1");
        p.setAmount(50.0);

        when(stripeService.getPaymentHistory("user-1")).thenReturn(List.of(p));

        mvc.perform(get("/api/users/payments"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value("pay-1"));
    }
}
