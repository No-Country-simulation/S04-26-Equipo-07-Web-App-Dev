package com.northpay.backend.repository;

import com.northpay.backend.model.Worker;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WorkerRepository extends MongoRepository<Worker, String> {
    Optional<Worker> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByStatus(String status);
}
