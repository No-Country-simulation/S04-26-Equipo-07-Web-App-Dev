package com.northpay.backend.service;

import com.northpay.backend.dto.auth.LoginResponse;
import com.northpay.backend.dto.auth.RegisterRequest;
import com.northpay.backend.dto.auth.SetPasswordRequest;
import com.northpay.backend.exception.AuthException;
import com.northpay.backend.model.*;
import com.northpay.backend.repository.*;
import com.northpay.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OnboardingRequestRepository onboardingRequestRepository;
    private final PasswordSetupTokenRepository setupTokenRepository;
    private final InvitationService invitationService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    // login de usuario con email y contrasena
    public LoginResponse login(String email, String password) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new AuthException("credenciales invalidas"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new AuthException("credenciales invalidas");
        }

        if ("inactive".equals(user.getStatus())) {
            throw new AuthException("cuenta desactivada");
        }

        if ("pending_password".equals(user.getStatus()) || "pending".equals(user.getStatus())) {
            throw new AuthException("cuenta pendiente de activacion");
        }

        String token = jwtUtil.generateToken(user.getId(), "user", List.of());
        return new LoginResponse(token, user.getId(), user.getEmail(),
            user.getFirstName(), user.getLastName(), "user", user.getCredits());
    }

    // registra al usuario usando el token de invitacion valido
    public User registerWithInvitation(RegisterRequest req) {
        Invitation invitation = invitationService.validateToken(req.getInvitationToken());

        if (!invitation.getEmail().equals(req.getEmail())) {
            throw new AuthException("el email no coincide con la invitacion");
        }

        if (userRepository.existsByEmail(req.getEmail())) {
            throw new AuthException("ya existe una cuenta con este email");
        }

        User user = new User();
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        user.setEmail(req.getEmail());
        user.setPhone(req.getPhone());
        user.setBirthDate(req.getBirthDate());
        user.setDocument(req.getDocument());
        user.setAddress(req.getAddress());
        user.setStatus("pending");

        userRepository.save(user);

        // crea la solicitud de onboarding pendiente de revision
        OnboardingRequest onboarding = new OnboardingRequest();
        onboarding.setUserId(user.getId());
        onboardingRequestRepository.save(onboarding);

        invitationService.useToken(req.getInvitationToken());
        return user;
    }

    // genera token de setup de contrasena para enviar al usuario tras aprobacion
    public String generatePasswordSetupToken(String userId) {
        byte[] tokenBytes = new byte[32];
        SECURE_RANDOM.nextBytes(tokenBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);

        PasswordSetupToken setupToken = new PasswordSetupToken();
        setupToken.setUserId(userId);
        setupToken.setToken(token);
        setupToken.setExpiresAt(LocalDateTime.now().plusHours(72));

        setupTokenRepository.save(setupToken);
        return token;
    }

    // configura la contrasena usando el token de un solo uso
    public void setupPassword(SetPasswordRequest req) {
        if (!req.getPassword().equals(req.getConfirmPassword())) {
            throw new AuthException("las contrasenas no coinciden");
        }

        PasswordSetupToken setupToken = setupTokenRepository.findByToken(req.getToken())
            .orElseThrow(() -> new AuthException("token invalido"));

        if (setupToken.isUsed()) {
            throw new AuthException("este token ya fue utilizado");
        }

        if (setupToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new AuthException("este token ha expirado");
        }

        User user = userRepository.findById(setupToken.getUserId())
            .orElseThrow(() -> new AuthException("usuario no encontrado"));

        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setStatus("active");
        userRepository.save(user);

        setupToken.setUsed(true);
        setupTokenRepository.save(setupToken);
    }
}
