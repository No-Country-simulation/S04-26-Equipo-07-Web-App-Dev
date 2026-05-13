package com.northpay.backend.service;

import com.northpay.backend.model.Contractor;
import com.northpay.backend.repository.ContractorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ContractorService {

    @Autowired
    private ContractorRepository contractorRepository;

    @Autowired
    private FileUploadService fileUploadService;

    // 1. Iniciar onboarding (Datos Personales)
    public Contractor createContractor(Contractor contractor) {
        contractor.setStatus("PENDING");
        System.out.println("Enviando notificación: Inicio de onboarding para " + contractor.getEmail());
        return contractorRepository.save(contractor);
    }

    // 2. Cargar documentos
    public Contractor uploadDocument(String id, String documentType, MultipartFile file) throws IOException {
        Optional<Contractor> contractorOpt = contractorRepository.findById(id);
        if (contractorOpt.isPresent()) {
            Contractor contractor = contractorOpt.get();
            String fileUrl = fileUploadService.uploadFile(file);
            contractor.getDocuments().put(documentType, fileUrl);
            return contractorRepository.save(contractor);
        }
        throw new RuntimeException("Contratista no encontrado con id: " + id);
    }

    // 3. Firmar contrato digital
    public Contractor signContract(String id) {
        Optional<Contractor> contractorOpt = contractorRepository.findById(id);
        if (contractorOpt.isPresent()) {
            Contractor contractor = contractorOpt.get();
            contractor.setContractSigned(true);
            return contractorRepository.save(contractor);
        }
        throw new RuntimeException("Contratista no encontrado con id: " + id);
    }

    // 4. Configuración del método de pago y cambio de estado
    public Contractor configurePaymentMethod(String id, Map<String, String> paymentMethodDetails) {
        Optional<Contractor> contractorOpt = contractorRepository.findById(id);
        if (contractorOpt.isPresent()) {
            Contractor contractor = contractorOpt.get();
            contractor.setPaymentMethod(paymentMethodDetails);
            
            // Según el flujo, después del paso 5 (verificación o configurar método de pago), 
            // el sistema lo marca como "PENDING_VERIFICATION"
            contractor.setStatus("PENDING_VERIFICATION");
            
            System.out.println("Enviando notificación: Etapas completadas. Pendiente de verificación interna para " + contractor.getEmail());
            return contractorRepository.save(contractor);
        }
        throw new RuntimeException("Contratista no encontrado con id: " + id);
    }

    // Obtener contratista por ID
    public Contractor getContractor(String id) {
        return contractorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contratista no encontrado con id: " + id));
    }

    // Listar todos los contratistas (Panel Admin)
    public List<Contractor> getAllContractors() {
        return contractorRepository.findAll();
    }

    // Actualizar estado por operador interno (Aprobar, Solicitar corrección)
    public Contractor updateStatus(String id, String newStatus) {
        Optional<Contractor> contractorOpt = contractorRepository.findById(id);
        if (contractorOpt.isPresent()) {
            Contractor contractor = contractorOpt.get();
            contractor.setStatus(newStatus);
            
            System.out.println("Enviando notificación: Estado actualizado a " + newStatus + " para " + contractor.getEmail());
            
            return contractorRepository.save(contractor);
        }
        throw new RuntimeException("Contratista no encontrado con id: " + id);
    }
}
