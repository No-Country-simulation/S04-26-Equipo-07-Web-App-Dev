package com.northpay.backend.repository;

import com.northpay.backend.model.WorkerLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkerLogRepository extends MongoRepository<WorkerLog, String> {
    Page<WorkerLog> findByWorkerIdOrderByTimestampDesc(String workerId, Pageable pageable);
}
