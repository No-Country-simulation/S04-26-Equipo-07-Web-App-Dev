package com.northpay.backend.service;

import com.northpay.backend.dto.convocatoria.ConvocatoriaRequest;
import com.northpay.backend.exception.InsufficientCreditsException;
import com.northpay.backend.exception.ResourceNotFoundException;
import com.northpay.backend.model.Convocatoria;
import com.northpay.backend.model.User;
import com.northpay.backend.repository.ConvocatoriaRepository;
import com.northpay.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConvocatoriaService {

    private final ConvocatoriaRepository convocatoriaRepository;
    private final UserRepository userRepository;

    @Value("${credits.convocatoria-cost:5}")
    private double convocatoriaCost;

    // crea una convocatoria y descuenta los creditos del usuario
    public Convocatoria create(String userId, ConvocatoriaRequest req) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("usuario no encontrado"));

        if (user.getCredits() < convocatoriaCost) {
            throw new InsufficientCreditsException(
                "creditos insuficientes. necesitas " + convocatoriaCost + " creditos, tienes " + user.getCredits()
            );
        }

        Convocatoria conv = new Convocatoria();
        conv.setCreatedBy(userId);
        conv.setCompanyId(req.getCompanyId());
        conv.setTitle(req.getTitle());
        conv.setDescription(req.getDescription());
        conv.setLocation(req.getLocation());
        conv.setModality(req.getModality());
        conv.setContractType(req.getContractType());
        conv.setCreditCost(convocatoriaCost);
        conv.setStatus("DRAFT");

        // descuenta creditos antes de guardar
        user.setCredits(user.getCredits() - convocatoriaCost);
        userRepository.save(user);

        return convocatoriaRepository.save(conv);
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

    public Convocatoria updateStatus(String id, String status) {
        Convocatoria conv = findById(id);
        conv.setStatus(status);
        return convocatoriaRepository.save(conv);
    }

    public Convocatoria publish(String id) {
        return updateStatus(id, "ACTIVE");
    }

    public Convocatoria close(String id) {
        return updateStatus(id, "CLOSED");
    }
}
