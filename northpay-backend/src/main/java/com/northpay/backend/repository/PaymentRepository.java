package com.northpay.backend.repository;

import com.northpay.backend.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {
    Optional<Payment> findByStripePaymentIntentId(String intentId);
    List<Payment> findByUserIdOrderByCreatedAtDesc(String userId);
    // busca pagos pendientes mas viejos que la fecha dada para cancelarlos
    List<Payment> findByStatusAndCreatedAtBefore(String status, LocalDateTime cutoff);
}
