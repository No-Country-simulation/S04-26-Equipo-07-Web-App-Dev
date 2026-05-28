package com.northpay.backend.controller;

import com.northpay.backend.model.User;
import com.northpay.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/worker/persons")
@RequiredArgsConstructor
public class PersonaController {

    private final UserRepository userRepository;

    // list all registered users (password redacted)
    @GetMapping
    public ResponseEntity<List<User>> findAll() {
        List<User> users = userRepository.findAll();
        users.forEach(u -> u.setPassword(null));
        return ResponseEntity.ok(users);
    }

    // get single user by id (password redacted)
    @GetMapping("/{id}")
    public ResponseEntity<User> findById(@PathVariable String id) {
        return userRepository.findById(id)
            .map(u -> { u.setPassword(null); return ResponseEntity.ok(u); })
            .orElse(ResponseEntity.notFound().build());
    }
}
