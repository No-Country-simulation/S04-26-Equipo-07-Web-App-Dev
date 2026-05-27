package com.northpay.backend.controller;

import com.northpay.backend.dto.payment.CreatePaymentRequest;
import com.northpay.backend.model.Payment;
import com.northpay.backend.model.User;
import com.northpay.backend.repository.PaymentRepository;
import com.northpay.backend.repository.UserRepository;
import com.northpay.backend.service.StripeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class PaymentController {

    private final StripeService stripeService;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;

    @PostMapping("/api/users/payments/create")
    public ResponseEntity<Map<String, String>> createPayment(
            @Valid @RequestBody CreatePaymentRequest req,
            @AuthenticationPrincipal(expression = "username") String userId) throws Exception {
        return ResponseEntity.ok(stripeService.createPaymentIntent(userId, req.getAmount()));
    }

    @GetMapping("/api/users/payments")
    public ResponseEntity<List<Payment>> getHistory(@AuthenticationPrincipal(expression = "username") String userId) {
        return ResponseEntity.ok(stripeService.getPaymentHistory(userId));
    }

    @GetMapping("/api/users/balance")
    public ResponseEntity<Map<String, Double>> getBalance(@AuthenticationPrincipal(expression = "username") String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow();
        return ResponseEntity.ok(Map.of("credits", user.getCredits()));
    }

    @GetMapping("/api/worker/payments")
    public ResponseEntity<List<Payment>> getAllPaymentsForWorkers() {
        List<Payment> payments = paymentRepository.findAll();
        payments.sort(Comparator.comparing(Payment::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed());
        return ResponseEntity.ok(payments);
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

