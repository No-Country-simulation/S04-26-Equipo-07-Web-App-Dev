package com.northpay.backend.service;

import com.northpay.backend.dto.request.ReviewDocumentRequest;
import com.northpay.backend.dto.request.ReviewInformationRequest;
import com.northpay.backend.dto.request.UpdateRequestStatusRequest;
import com.northpay.backend.exception.ResourceNotFoundException;
import com.northpay.backend.model.OnboardingRequest;
import com.northpay.backend.model.User;
import com.northpay.backend.repository.OnboardingRequestRepository;
import com.northpay.backend.repository.UserRepository;
import com.northpay.backend.service.LogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RequestService {

    private final OnboardingRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final LogService logService;
    private final InvitationService invitationService;

    public List<OnboardingRequest> findAll() {
        return requestRepository.findAll();
    }

    public List<OnboardingRequest> findByStatus(String status) {
        return requestRepository.findByStatus(status);
    }

    public OnboardingRequest findById(String id) {
        return requestRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("solicitud no encontrada: " + id));
    }

    // asigna un trabajador a la solicitud y la pone en revision
    public OnboardingRequest assignWorker(String requestId, String workerId) {
        OnboardingRequest req = findById(requestId);
        req.setAssignedWorkerId(workerId);
        req.setStatus("IN_REVIEW");
        addAction(req, workerId, "ASSIGNED", "trabajador asignado");
        OnboardingRequest saved = requestRepository.save(req);
        notificationService.notifyUser(req.getUserId(), Map.of("status", "IN_REVIEW"));
        logService.logWorker(workerId, "REQUEST_ASSIGNED", "solicitud " + requestId + " asignada");
        logService.logUser(req.getUserId(), "REQUEST_IN_REVIEW", "solicitud en revision");
        return saved;
    }

    // revisa un documento individual: aprueba o rechaza con observacion opcional
    public OnboardingRequest reviewDocument(String requestId, String workerId, ReviewDocumentRequest dto) {
        OnboardingRequest req = findById(requestId);

        // busca o crea la revision del documento
        Optional<OnboardingRequest.DocumentReview> existing = req.getDocumentReviews().stream()
            .filter(d -> d.getDocumentKey().equals(dto.getDocumentKey()))
            .findFirst();

        OnboardingRequest.DocumentReview review;
        if (existing.isPresent()) {
            review = existing.get();
        } else {
            review = new OnboardingRequest.DocumentReview();
            review.setDocumentKey(dto.getDocumentKey());
            req.getDocumentReviews().add(review);
        }

        review.setStatus(dto.getStatus());
        review.setObservation(dto.getObservation());
        review.setReviewedBy(workerId);
        review.setReviewedAt(LocalDateTime.now());

        addAction(req, workerId, "DOCUMENT_" + dto.getStatus(), dto.getDocumentKey());

        OnboardingRequest saved = requestRepository.save(req);

        // notifica al usuario por email si el documento fue rechazado
        if ("REJECTED".equals(dto.getStatus())) {
            User user = userRepository.findById(req.getUserId()).orElse(null);
            if (user != null) {
                emailService.sendDocumentRejectionEmail(
                    user.getEmail(), dto.getDocumentKey(),
                    dto.getObservation(), user.getFirstName()
                );
            }
        }

        notificationService.notifyUser(req.getUserId(), Map.of("documentKey", dto.getDocumentKey(), "status", dto.getStatus()));
        logService.logWorker(workerId, "DOCUMENT_REVIEWED",
            requestId + " | " + dto.getDocumentKey() + " = " + dto.getStatus());
        logService.logUser(req.getUserId(), "DOCUMENT_" + dto.getStatus(), dto.getDocumentKey());
        return saved;
    }

    // revisa un campo de información personal: aprueba o rechaza con observación opcional
    public OnboardingRequest reviewInformation(String requestId, String workerId, ReviewInformationRequest dto) {
        OnboardingRequest req = findById(requestId);

        Optional<OnboardingRequest.InformationReview> existing = req.getInformationReviews().stream()
            .filter(r -> r.getField().equals(dto.getField()))
            .findFirst();

        OnboardingRequest.InformationReview review;
        if (existing.isPresent()) {
            review = existing.get();
        } else {
            review = new OnboardingRequest.InformationReview();
            review.setField(dto.getField());
            req.getInformationReviews().add(review);
        }

        review.setStatus(dto.getStatus());
        review.setObservation(dto.getObservation());
        review.setReviewedBy(workerId);
        review.setReviewedAt(LocalDateTime.now());

        addAction(req, workerId, "INFO_" + dto.getStatus(), dto.getField());

        OnboardingRequest saved = requestRepository.save(req);

        notificationService.notifyUser(req.getUserId(), Map.of("field", dto.getField(), "status", dto.getStatus()));
        logService.logWorker(workerId, "INFO_REVIEWED",
            requestId + " | " + dto.getField() + " = " + dto.getStatus());
        logService.logUser(req.getUserId(), "INFO_" + dto.getStatus(), dto.getField());
        return saved;
    }

    // actualiza el estado general de la solicitud
    public OnboardingRequest updateStatus(String requestId, String workerId, UpdateRequestStatusRequest dto) {
        OnboardingRequest req = findById(requestId);
        req.setStatus(dto.getStatus());
        addAction(req, workerId, dto.getStatus(), dto.getNotes());

        OnboardingRequest saved = requestRepository.save(req);

        // si la solicitud es aprobada, genera token de setup de contrasena y envia email
        if ("APPROVED".equals(dto.getStatus())) {
            User user = userRepository.findById(req.getUserId()).orElse(null);
            if (user != null) {
                String setupToken = authService.generatePasswordSetupToken(user.getId());
                emailService.sendApprovalEmail(user.getEmail(), setupToken, user.getFirstName());
                user.setStatus("pending_password");
                userRepository.save(user);
                invitationService.markAsApproved(user.getEmail());
            }
        }

        notificationService.notifyUser(req.getUserId(), Map.of("requestStatus", dto.getStatus()));
        notificationService.notifyWorkers(Map.of("requestId", requestId, "status", dto.getStatus()));
        logService.logWorker(workerId, "REQUEST_STATUS_UPDATED",
            requestId + " → " + dto.getStatus());
        logService.logUser(req.getUserId(), "REQUEST_" + dto.getStatus(), dto.getNotes() != null ? dto.getNotes() : "");
        return saved;
    }

    // elimina una solicitud rechazada y resetea la invitacion
    public void deleteRejectedRequest(String requestId, String workerId) {
        OnboardingRequest req = findById(requestId);
        if (!"REJECTED".equals(req.getStatus())) {
            throw new IllegalArgumentException("solo se pueden eliminar solicitudes rechazadas");
        }
        User user = userRepository.findById(req.getUserId()).orElse(null);
        requestRepository.delete(req);
        if (user != null) {
            invitationService.resetToResend(user.getEmail());
        }
        logService.logWorker(workerId, "REQUEST_DELETED", "solicitud rechazada eliminada: " + requestId);
    }

    private void addAction(OnboardingRequest req, String workerId, String action, String notes) {
        OnboardingRequest.ActionEntry entry = new OnboardingRequest.ActionEntry();
        entry.setWorkerId(workerId);
        entry.setAction(action);
        entry.setNotes(notes);
        entry.setTimestamp(LocalDateTime.now());
        req.getActionHistory().add(entry);
    }
}
