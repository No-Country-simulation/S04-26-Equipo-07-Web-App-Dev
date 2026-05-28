package com.northpay.backend.repository;

import com.northpay.backend.model.PasswordSetupToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordSetupTokenRepository extends MongoRepository<PasswordSetupToken, String> {
    Optional<PasswordSetupToken> findByToken(String token);
}
