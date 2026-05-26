package com.northpay.backend.service;

import com.northpay.backend.dto.auth.LoginResponse;
import com.northpay.backend.dto.worker.CreateWorkerRequest;
import com.northpay.backend.exception.AuthException;
import com.northpay.backend.model.Role;
import com.northpay.backend.model.Worker;
import com.northpay.backend.repository.RoleRepository;
import com.northpay.backend.repository.WorkerRepository;
import com.northpay.backend.security.JwtUtil;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkerAuthService {

    private final WorkerRepository workerRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${app.admin.email:admin@northpay.com}")
    private String adminEmail;

    @Value("${app.admin.password:Admin@NorthPay2026!}")
    private String adminPassword;

    // crea el primer trabajador admin si no existe ninguno en la db
    @PostConstruct
    public void createInitialAdmin() {
        if (workerRepository.countByStatus("active") == 0) {
            log.info("no se encontraron trabajadores activos, creando admin inicial");
            Worker admin = new Worker();
            admin.setFirstName("Admin");
            admin.setLastName("NorthPay");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setStatus("active");
            admin.setRoleIds(new ArrayList<>());
            workerRepository.save(admin);
            log.info("admin inicial creado con email: {}", adminEmail);
        }
    }

    // login de trabajador con email y contrasena
    public LoginResponse workerLogin(String email, String password) {
        Worker worker = workerRepository.findByEmail(email)
            .orElseThrow(() -> new AuthException("credenciales invalidas"));

        if (!passwordEncoder.matches(password, worker.getPassword())) {
            throw new AuthException("credenciales invalidas");
        }

        if (!"active".equals(worker.getStatus())) {
            throw new AuthException("cuenta de trabajador desactivada");
        }

        // carga los nombres de roles para incluirlos en el jwt
        List<String> roleNames = loadRoleNames(worker.getRoleIds());
        String token = jwtUtil.generateToken(worker.getId(), "worker", roleNames);

        return new LoginResponse(token, worker.getId(), worker.getEmail(),
            worker.getFirstName(), worker.getLastName(), "worker", 0.0);
    }

    private List<String> loadRoleNames(List<String> roleIds) {
        if (roleIds == null || roleIds.isEmpty()) return new ArrayList<>();
        return roleRepository.findAllById(roleIds)
            .stream()
            .map(Role::getName)
            .collect(Collectors.toList());
    }
}
