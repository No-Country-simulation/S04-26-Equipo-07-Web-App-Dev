package com.northpay.backend.service;

import com.northpay.backend.dto.convocatoria.ConvocatoriaRequest;
import com.northpay.backend.exception.InsufficientCreditsException;
import com.northpay.backend.exception.ResourceNotFoundException;
import com.northpay.backend.model.Application;
import com.northpay.backend.model.Convocatoria;
import com.northpay.backend.model.User;
import com.northpay.backend.repository.ApplicationRepository;
import com.northpay.backend.repository.ConvocatoriaRepository;
import com.northpay.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ConvocatoriaService {

    private final ConvocatoriaRepository convocatoriaRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final LogService logService;
    private final FileUploadService fileUploadService;

    /** Calcula el costo en creditos: $1/dia entre startDate y endDate (minimo 1) */
    public static double calculateCost(LocalDate start, LocalDate end) {
        if (start == null || end == null) return 0;
        long days = ChronoUnit.DAYS.between(start, end);
        return Math.max(1, days);
    }

    /** Crea convocatoria en estado DRAFT sin cobrar creditos */
    public Convocatoria create(String userId, ConvocatoriaRequest req) {
        Convocatoria conv = new Convocatoria();
        conv.setCreatedBy(userId);
        applyRequest(conv, req);
        conv.setStatus("DRAFT");
        conv.setCreditCost(calculateCost(req.getStartDate(), req.getEndDate()));

        Convocatoria saved = convocatoriaRepository.save(conv);
        logService.logUser(userId, "CONVOCATORIA_CREATED", "convocatoria creada (draft): " + conv.getTitle());
        return saved;
    }

    /** Actualiza convocatoria en estado DRAFT */
    public Convocatoria update(String id, String userId, ConvocatoriaRequest req) {
        Convocatoria conv = findById(id);
        if (!"DRAFT".equals(conv.getStatus())) {
            throw new IllegalStateException("solo se puede editar una convocatoria en estado DRAFT");
        }
        applyRequest(conv, req);
        conv.setCreditCost(calculateCost(req.getStartDate(), req.getEndDate()));
        Convocatoria saved = convocatoriaRepository.save(conv);
        logService.logUser(userId, "CONVOCATORIA_UPDATED", "convocatoria actualizada: " + conv.getTitle());
        return saved;
    }

    private void applyRequest(Convocatoria conv, ConvocatoriaRequest req) {
        conv.setCompanyId(req.getCompanyId());
        conv.setTitle(req.getTitle());
        conv.setDescription(req.getDescription());
        conv.setLocation(req.getLocation());
        conv.setModality(req.getModality());
        conv.setContractType(req.getContractType());
        conv.setSalaryMin(req.getSalaryMin());
        conv.setSalaryMax(req.getSalaryMax());
        conv.setStartDate(req.getStartDate());
        conv.setEndDate(req.getEndDate());
        if (req.getTechnicalRequirements() != null) conv.setTechnicalRequirements(req.getTechnicalRequirements());
        if (req.getQuestions() != null) conv.setQuestions(req.getQuestions());
    }

    /** Publica la convocatoria: cobra creditos al usuario */
    public Convocatoria publish(String id) {
        Convocatoria conv = findById(id);
        User user = userRepository.findById(conv.getCreatedBy())
            .orElseThrow(() -> new ResourceNotFoundException("usuario no encontrado"));

        double cost = conv.getCreditCost();
        if (user.getCredits() < cost) {
            throw new InsufficientCreditsException(
                "creditos insuficientes. necesitas " + cost + " creditos, tienes " + user.getCredits()
            );
        }

        user.setCredits(user.getCredits() - cost);
        userRepository.save(user);

        conv.setStatus("ACTIVE");
        conv.setActivatedAt(LocalDateTime.now());
        Convocatoria saved = convocatoriaRepository.save(conv);
        logService.logUser(conv.getCreatedBy(), "CONVOCATORIA_PUBLISHED",
            "convocatoria publicada: " + conv.getTitle() + " | costo: " + cost);
        return saved;
    }

    /** Cierra sin devolver creditos */
    public Convocatoria close(String id) {
        Convocatoria conv = findById(id);
        conv.setStatus("CLOSED");
        Convocatoria saved = convocatoriaRepository.save(conv);
        logService.logUser(conv.getCreatedBy(), "CONVOCATORIA_CLOSED", "convocatoria cerrada: " + conv.getTitle());
        return saved;
    }

    /** Finaliza y devuelve creditos proporcionales al tiempo no consumido */
    public Map<String, Object> finalize(String id, String userId) {
        Convocatoria conv = findById(id);
        if (!"ACTIVE".equals(conv.getStatus())) {
            throw new IllegalStateException("solo se puede finalizar una convocatoria activa");
        }

        LocalDate today = LocalDate.now();
        LocalDate start = conv.getStartDate() != null ? conv.getStartDate() : today;
        LocalDate end = conv.getEndDate() != null ? conv.getEndDate() : today;

        long totalDays = Math.max(1, ChronoUnit.DAYS.between(start, end));
        long daysUsed = Math.min(ChronoUnit.DAYS.between(start, today), totalDays);
        daysUsed = Math.max(0, daysUsed);

        double costPerDay = conv.getCreditCost() / totalDays;
        double creditsUsed = costPerDay * daysUsed;
        double creditsToReturn = conv.getCreditCost() - creditsUsed;
        creditsToReturn = Math.max(0, Math.round(creditsToReturn * 100.0) / 100.0);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("usuario no encontrado"));
        user.setCredits(user.getCredits() + creditsToReturn);
        userRepository.save(user);

        conv.setStatus("CLOSED");
        convocatoriaRepository.save(conv);

        logService.logUser(userId, "CONVOCATORIA_FINALIZED",
            "convocatoria finalizada: " + conv.getTitle() + " | creditos devueltos: " + creditsToReturn);

        Map<String, Object> result = new HashMap<>();
        result.put("status", "CLOSED");
        result.put("creditsReturned", creditsToReturn);
        result.put("newBalance", user.getCredits());
        return result;
    }

    /** Incrementa contador de vistas */
    public void incrementViews(String id) {
        Convocatoria conv = findById(id);
        conv.setViews(conv.getViews() + 1);
        convocatoriaRepository.save(conv);
    }

    /** Registra una postulacion */
    public Application apply(String convocatoriaId, String applicantName, String applicantEmail,
                             String applicantPhone, String applicantLinkedIn,
                             List<String> answers, MultipartFile file) throws Exception {
        Convocatoria conv = findById(convocatoriaId);
        if (!"ACTIVE".equals(conv.getStatus())) {
            throw new IllegalStateException("la convocatoria no esta activa");
        }

        Application app = new Application();
        app.setConvocatoriaId(convocatoriaId);
        app.setApplicantName(applicantName);
        app.setApplicantEmail(applicantEmail);
        app.setApplicantPhone(applicantPhone);
        app.setApplicantLinkedIn(applicantLinkedIn);
        app.setAnswers(answers != null ? answers : List.of());

        if (file != null && !file.isEmpty()) {
            String fileUrl = fileUploadService.uploadFile(file);
            app.setFileUrl(fileUrl);
        }

        Application saved = applicationRepository.save(app);

        conv.setApplicationCount(conv.getApplicationCount() + 1);
        convocatoriaRepository.save(conv);

        logService.logUser(conv.getCreatedBy(), "CONVOCATORIA_APPLICATION",
            "nueva postulacion en: " + conv.getTitle() + " de: " + applicantEmail);

        return saved;
    }

    /** Lista postulaciones de una convocatoria */
    public List<Application> getApplications(String convocatoriaId) {
        return applicationRepository.findByConvocatoriaId(convocatoriaId);
    }

    public List<Convocatoria> findByUser(String userId) {
        return convocatoriaRepository.findByCreatedBy(userId);
    }

    public List<Convocatoria> findAll() {
        return convocatoriaRepository.findAll();
    }

    public Convocatoria findById(String id) {
        return convocatoriaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("convocatoria no encontrada: " + id));
    }
}
