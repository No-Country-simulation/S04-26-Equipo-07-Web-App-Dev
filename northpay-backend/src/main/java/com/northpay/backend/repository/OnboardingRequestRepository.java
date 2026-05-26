package com.northpay.backend.repository;

import com.northpay.backend.model.OnboardingRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OnboardingRequestRepository extends MongoRepository<OnboardingRequest, String> {
    Optional<OnboardingRequest> findByUserId(String userId);
    List<OnboardingRequest> findByStatus(String status);
    List<OnboardingRequest> findByAssignedWorkerId(String workerId);
}
