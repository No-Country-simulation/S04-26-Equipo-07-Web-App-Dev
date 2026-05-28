package com.northpay.backend.repository;

import com.northpay.backend.model.Invitation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvitationRepository extends MongoRepository<Invitation, String> {
    Optional<Invitation> findByToken(String token);
    Optional<Invitation> findByEmail(String email);
    boolean existsByEmailAndStatus(String email, String status);
    List<Invitation> findByInvitedByOrderByCreatedAtDesc(String workerId);
}
