package com.northpay.backend.service;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import com.northpay.backend.exception.ResourceNotFoundException;
import com.northpay.backend.model.Payment;
import com.northpay.backend.model.User;
import com.northpay.backend.repository.PaymentRepository;
import com.northpay.backend.repository.UserRepository;
import com.northpay.backend.service.LogService;
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
    private final LogService logService;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

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

    // crea una sesion de checkout de stripe para redirigir al usuario a la pagina de pago
    public Map<String, String> createCheckoutSession(String userId, double amount) throws StripeException {
        long amountCents = Math.round(amount * 100);

        // crea el registro de pago antes de la sesion para poder referenciarlo en el webhook
        Payment payment = new Payment();
        payment.setUserId(userId);
        payment.setAmount(amount);
        paymentRepository.save(payment);

        SessionCreateParams params = SessionCreateParams.builder()
            .setMode(SessionCreateParams.Mode.PAYMENT)
            .setSuccessUrl(frontendUrl + "/dashboard/movimientos?stripe=success&paymentId=" + payment.getId())
            .setCancelUrl(frontendUrl + "/dashboard/movimientos?stripe=cancel")
            .addLineItem(SessionCreateParams.LineItem.builder()
                .setQuantity(1L)
                .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                    .setCurrency("usd")
                    .setUnitAmount(amountCents)
                    .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                        .setName("Creditos NorthPay")
                        .setDescription("Recarga de creditos USD")
                        .build())
                    .build())
                .build())
            .putMetadata("userId", userId)
            .putMetadata("paymentId", payment.getId())
            .build();

        Session session = Session.create(params);

        // guarda el id de sesion para poder rastrearlo en el webhook
        payment.setStripePaymentIntentId(session.getId());
        paymentRepository.save(payment);

        logService.logUser(userId, "PAYMENT_CHECKOUT_INITIATED", "checkout iniciado USD " + amount);
        return Map.of("url", session.getUrl(), "paymentId", payment.getId());
    }

    // verifica el estado del checkout con stripe y acredita si fue pagado (fallback para cuando el webhook no dispara)
    public Map<String, Object> verifyAndCredit(String paymentId, String userId) throws StripeException {
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new ResourceNotFoundException("pago no encontrado: " + paymentId));

        if (!userId.equals(payment.getUserId())) {
            throw new RuntimeException("acceso denegado al pago");
        }

        // idempotente: ya fue procesado por webhook o llamada anterior
        if ("ACCEPTED".equals(payment.getStatus())) {
            User user = userRepository.findById(userId).orElseThrow();
            return Map.of("status", "ACCEPTED", "credits", user.getCredits(), "alreadyProcessed", true);
        }

        if (payment.getStripePaymentIntentId() == null) {
            return Map.of("status", payment.getStatus(), "credits", 0.0, "alreadyProcessed", false);
        }

        // recupera la sesion de stripe para verificar el estado del pago
        Session session = Session.retrieve(payment.getStripePaymentIntentId());
        if ("paid".equals(session.getPaymentStatus())) {
            payment.setStatus("ACCEPTED");
            paymentRepository.save(payment);
            creditUser(userId, payment.getAmount());
            logService.logUser(userId, "PAYMENT_ACCEPTED", "pago verificado USD " + payment.getAmount());
            User user = userRepository.findById(userId).orElseThrow();
            log.info("pago verificado y acreditado para usuario {}, amount: {}", userId, payment.getAmount());
            return Map.of("status", "ACCEPTED", "credits", user.getCredits(), "alreadyProcessed", false);
        }

        return Map.of("status", payment.getStatus(), "credits", 0.0, "alreadyProcessed", false);
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

        // distingue entre pago por checkout session (prefijo __checkout__) y payment intent directo
        Payment payment;
        if (intentId.startsWith("__checkout__")) {
            String paymentId = intentId.substring("__checkout__".length());
            payment = paymentRepository.findById(paymentId).orElse(null);
        } else {
            payment = paymentRepository.findByStripePaymentIntentId(intentId).orElse(null);
        }
        if (payment == null) {
            log.warn("payment no encontrado en db para id: {}", intentId);
            return;
        }

        switch (event.getType()) {
            case "payment_intent.succeeded" -> {
                payment.setStatus("ACCEPTED");
                paymentRepository.save(payment);
                // acredita el monto en la cuenta del usuario (1 USD = 1 credito)
                creditUser(payment.getUserId(), payment.getAmount());
                logService.logUser(payment.getUserId(), "PAYMENT_ACCEPTED", "pago aceptado USD " + payment.getAmount());
                log.info("pago aceptado para usuario {}, amount: {}", payment.getUserId(), payment.getAmount());
            }
            case "payment_intent.payment_failed" -> {
                payment.setStatus("CANCELLED");
                paymentRepository.save(payment);
                logService.logUser(payment.getUserId(), "PAYMENT_FAILED", "pago fallido USD " + payment.getAmount());
                log.info("pago fallido para usuario {}", payment.getUserId());
            }
            case "checkout.session.completed" -> {
                // la sesion de checkout fue completada exitosamente — solo credita si no fue ya procesado por verify
                if (!"ACCEPTED".equals(payment.getStatus())) {
                    payment.setStatus("ACCEPTED");
                    paymentRepository.save(payment);
                    creditUser(payment.getUserId(), payment.getAmount());
                    logService.logUser(payment.getUserId(), "PAYMENT_ACCEPTED", "checkout completado USD " + payment.getAmount());
                    log.info("checkout completado para usuario {}, amount: {}", payment.getUserId(), payment.getAmount());
                } else {
                    log.info("checkout ya procesado previamente para usuario {}", payment.getUserId());
                }
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
            if (dataObject.isPresent()) {
                if (dataObject.get() instanceof PaymentIntent intent) {
                    return intent.getId();
                }
                // para checkout sessions extrae el paymentId del metadata
                if (dataObject.get() instanceof Session session) {
                    String paymentId = session.getMetadata().get("paymentId");
                    if (paymentId != null) {
                        // busca por id interno, no por stripePaymentIntentId
                        return "__checkout__" + paymentId;
                    }
                }
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
