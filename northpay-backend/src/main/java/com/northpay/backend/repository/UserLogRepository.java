package com.northpay.backend.repository;

import com.northpay.backend.model.UserLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserLogRepository extends MongoRepository<UserLog, String> {
    Page<UserLog> findByUserIdOrderByTimestampDesc(String userId, Pageable pageable);
    Page<UserLog> findAllByOrderByTimestampDesc(Pageable pageable);
}
