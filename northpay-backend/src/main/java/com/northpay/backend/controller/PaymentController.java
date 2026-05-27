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
import org.springframework.security.core.userdetails.UserDetails;
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
            @AuthenticationPrincipal UserDetails principal) throws Exception {
        return ResponseEntity.ok(stripeService.createPaymentIntent(principal.getUsername(), req.getAmount()));
    }

    // crea una sesion de checkout de stripe para redirigir al usuario al pago
    @PostMapping("/api/users/payments/checkout")
    public ResponseEntity<Map<String, String>> createCheckout(
            @Valid @RequestBody CreatePaymentRequest req,
            @AuthenticationPrincipal UserDetails principal) throws Exception {
        return ResponseEntity.ok(stripeService.createCheckoutSession(principal.getUsername(), req.getAmount()));
    }

    // verifica el checkout de stripe y acredita al usuario (fallback cuando el webhook no dispara en dev)
    @PostMapping("/api/users/payments/{paymentId}/verify")
    public ResponseEntity<Map<String, Object>> verifyPayment(
            @PathVariable String paymentId,
            @AuthenticationPrincipal UserDetails principal) throws Exception {
        return ResponseEntity.ok(stripeService.verifyAndCredit(paymentId, principal.getUsername()));
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

