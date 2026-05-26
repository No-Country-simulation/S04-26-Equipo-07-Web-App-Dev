package com.northpay.backend.service;

import com.northpay.backend.dto.worker.CreateWorkerRequest;
import com.northpay.backend.exception.AuthException;
import com.northpay.backend.model.Worker;
import com.northpay.backend.repository.WorkerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkerService {

    private final WorkerRepository workerRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Worker> findAll() {
        List<Worker> workers = workerRepository.findAll();
        // no exponer contrasenas
        workers.forEach(w -> w.setPassword(null));
        return workers;
    }

    public Worker findById(String id) {
        Worker worker = workerRepository.findById(id)
            .orElseThrow(() -> new AuthException("trabajador no encontrado"));
        worker.setPassword(null);
        return worker;
    }

    public Worker create(CreateWorkerRequest req) {
        if (workerRepository.existsByEmail(req.getEmail())) {
            throw new AuthException("ya existe un trabajador con este email");
        }
        Worker worker = new Worker();
        worker.setFirstName(req.getFirstName());
        worker.setLastName(req.getLastName());
        worker.setEmail(req.getEmail());
        worker.setPassword(passwordEncoder.encode(req.getPassword()));
        worker.setRoleIds(new ArrayList<>());
        worker.setStatus("active");
        Worker saved = workerRepository.save(worker);
        saved.setPassword(null);
        return saved;
    }

    // asigna roles al trabajador
    public Worker assignRoles(String workerId, List<String> roleIds) {
        Worker worker = workerRepository.findById(workerId)
            .orElseThrow(() -> new AuthException("trabajador no encontrado"));
        worker.setRoleIds(roleIds);
        Worker saved = workerRepository.save(worker);
        saved.setPassword(null);
        return saved;
    }

    public void deactivate(String workerId) {
        Worker worker = workerRepository.findById(workerId)
            .orElseThrow(() -> new AuthException("trabajador no encontrado"));
        worker.setStatus("inactive");
        workerRepository.save(worker);
    }
}
