package com.northpay.backend.controller;

import com.northpay.backend.dto.payment.CreatePaymentRequest;
import com.northpay.backend.model.Payment;
import com.northpay.backend.model.User;
import com.northpay.backend.repository.UserRepository;
import com.northpay.backend.service.StripeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class PaymentController {

    private final StripeService stripeService;
    private final UserRepository userRepository;

    @PostMapping("/api/users/payments/create")
    public ResponseEntity<Map<String, String>> createPayment(
            @Valid @RequestBody CreatePaymentRequest req,
            @AuthenticationPrincipal UserDetails principal) throws Exception {
        return ResponseEntity.ok(stripeService.createPaymentIntent(principal.getUsername(), req.getAmount()));
    }

    @GetMapping("/api/users/payments")
    public ResponseEntity<List<Payment>> getHistory(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(stripeService.getPaymentHistory(principal.getUsername()));
    }

    @GetMapping("/api/users/balance")
    public ResponseEntity<Map<String, Double>> getBalance(@AuthenticationPrincipal UserDetails principal) {
        User user = userRepository.findById(principal.getUsername())
            .orElseThrow();
        return ResponseEntity.ok(Map.of("credits", user.getCredits()));
    }

    // endpoint publico para webhooks de stripe
    @PostMapping("/api/payments/webhook")
    public ResponseEntity<Void> webhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        stripeService.handleWebhook(payload, sigHeader);
        return ResponseEntity.ok().build();
    }
}
