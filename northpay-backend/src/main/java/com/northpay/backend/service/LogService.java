package com.northpay.backend.service;

import com.northpay.backend.model.UserLog;
import com.northpay.backend.model.WorkerLog;
import com.northpay.backend.repository.UserLogRepository;
import com.northpay.backend.repository.WorkerLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LogService {

    private final UserLogRepository userLogRepository;
    private final WorkerLogRepository workerLogRepository;

    @Async
    public void logUser(String userId, String action, String details, HttpServletRequest request) {
        UserLog log = new UserLog();
        log.setUserId(userId);
        log.setAction(action);
        log.setDetails(details);
        log.setIpAddress(getClientIp(request));
        userLogRepository.save(log);
    }

    // sobrecarga sin HttpServletRequest para logging interno desde servicios
    @Async
    public void logUser(String userId, String action, String details) {
        UserLog log = new UserLog();
        log.setUserId(userId);
        log.setAction(action);
        log.setDetails(details);
        log.setIpAddress("system");
        userLogRepository.save(log);
    }

    @Async
    public void logWorker(String workerId, String action, String details, HttpServletRequest request) {
        WorkerLog log = new WorkerLog();
        log.setWorkerId(workerId);
        log.setAction(action);
        log.setDetails(details);
        log.setIpAddress(getClientIp(request));
        workerLogRepository.save(log);
    }

    // sobrecarga sin HttpServletRequest para logging interno desde servicios
    @Async
    public void logWorker(String workerId, String action, String details) {
        WorkerLog log = new WorkerLog();
        log.setWorkerId(workerId);
        log.setAction(action);
        log.setDetails(details);
        log.setIpAddress("system");
        workerLogRepository.save(log);
    }

    public Page<UserLog> getUserLogs(String userId, Pageable pageable) {
        if (userId == null || userId.isBlank()) {
            return userLogRepository.findAllByOrderByTimestampDesc(pageable);
        }
        return userLogRepository.findByUserIdOrderByTimestampDesc(userId, pageable);
    }

    public Page<WorkerLog> getWorkerLogs(String workerId, Pageable pageable) {
        if (workerId == null || workerId.isBlank()) {
            return workerLogRepository.findAllByOrderByTimestampDesc(pageable);
        }
        return workerLogRepository.findByWorkerIdOrderByTimestampDesc(workerId, pageable);
    }

    // extrae la ip real del cliente considerando proxies
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
