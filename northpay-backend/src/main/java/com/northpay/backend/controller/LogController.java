package com.northpay.backend.controller;

import com.northpay.backend.model.UserLog;
import com.northpay.backend.model.WorkerLog;
import com.northpay.backend.service.LogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/worker/logs")
@RequiredArgsConstructor
public class LogController {

    private final LogService logService;

    @GetMapping("/users")
    public ResponseEntity<Page<UserLog>> getUserLogs(
            @RequestParam(required = false) String userId,
            Pageable pageable) {
        return ResponseEntity.ok(logService.getUserLogs(userId, pageable));
    }

    @GetMapping("/workers")
    public ResponseEntity<Page<WorkerLog>> getWorkerLogs(
            @RequestParam(required = false) String workerId,
            Pageable pageable) {
        return ResponseEntity.ok(logService.getWorkerLogs(workerId, pageable));
    }
}
