package com.northpay.backend.service;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import com.northpay.backend.exception.ResourceNotFoundException;
import com.northpay.backend.model.Payment;
import com.northpay.backend.model.User;
import com.northpay.backend.repository.PaymentRepository;
import com.northpay.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class StripeService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @Value("${credits.payment-expiry-minutes:30}")
    private int paymentExpiryMinutes;

    // crea un payment intent en stripe y guarda el pago en estado pendiente
    public Map<String, String> createPaymentIntent(String userId, double amount) throws StripeException {
        // stripe maneja montos en centavos
        long amountCents = Math.round(amount * 100);

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
            .setAmount(amountCents)
            .setCurrency("usd")
            .putMetadata("userId", userId)
            .build();

        PaymentIntent intent = PaymentIntent.create(params);

        Payment payment = new Payment();
        payment.setUserId(userId);
        payment.setAmount(amount);
        payment.setStripePaymentIntentId(intent.getId());
        payment.setStripeClientSecret(intent.getClientSecret());
        paymentRepository.save(payment);

        return Map.of(
            "clientSecret", intent.getClientSecret(),
            "paymentId", payment.getId()
        );
    }

    // maneja el webhook de stripe para actualizar el estado del pago
    public void handleWebhook(String payload, String sigHeader) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.warn("firma de webhook de stripe invalida");
            throw new RuntimeException("firma de webhook invalida");
        }

        String intentId = extractIntentId(event);
        if (intentId == null) return;

        Payment payment = paymentRepository.findByStripePaymentIntentId(intentId).orElse(null);
        if (payment == null) {
            log.warn("payment intent no encontrado en db: {}", intentId);
            return;
        }

        switch (event.getType()) {
            case "payment_intent.succeeded" -> {
                payment.setStatus("ACCEPTED");
                paymentRepository.save(payment);
                // acredita el monto en la cuenta del usuario (1 USD = 1 credito)
                creditUser(payment.getUserId(), payment.getAmount());
                log.info("pago aceptado para usuario {}, amount: {}", payment.getUserId(), payment.getAmount());
            }
            case "payment_intent.payment_failed" -> {
                payment.setStatus("CANCELLED");
                paymentRepository.save(payment);
                log.info("pago fallido para usuario {}", payment.getUserId());
            }
            default -> log.debug("evento stripe no manejado: {}", event.getType());
        }
    }

    private void creditUser(String userId, double amount) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("usuario no encontrado: " + userId));
        user.setCredits(user.getCredits() + amount);
        userRepository.save(user);
    }

    private String extractIntentId(Event event) {
        try {
            var dataObject = event.getDataObjectDeserializer().getObject();
            if (dataObject.isPresent() && dataObject.get() instanceof PaymentIntent intent) {
                return intent.getId();
            }
        } catch (Exception e) {
            log.error("error extrayendo intent id del evento stripe", e);
        }
        return null;
    }

    public List<Payment> getPaymentHistory(String userId) {
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // cancela pagos pendientes que hayan superado el tiempo de expiracion
    @Scheduled(fixedRate = 300000)
    public void cancelExpiredPayments() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(paymentExpiryMinutes);
        List<Payment> expired = paymentRepository.findByStatusAndCreatedAtBefore("PENDING", cutoff);
        if (!expired.isEmpty()) {
            expired.forEach(p -> p.setStatus("CANCELLED"));
            paymentRepository.saveAll(expired);
            log.info("cancelados {} pagos expirados", expired.size());
        }
    }
}
