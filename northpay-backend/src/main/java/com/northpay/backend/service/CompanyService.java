package com.northpay.backend.service;

import com.northpay.backend.exception.ResourceNotFoundException;
import com.northpay.backend.model.Company;
import com.northpay.backend.model.User;
import com.northpay.backend.repository.CompanyRepository;
import com.northpay.backend.repository.UserRepository;
import com.northpay.backend.service.LogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final LogService logService;

    public List<Company> listByActor(String actorId) {
        User user = userRepository.findById(actorId).orElse(null);
        if (user == null) {
            return companyRepository.findAll();
        }

        if (user.getCompanyIds() == null || user.getCompanyIds().isEmpty()) {
            return List.of();
        }

        return companyRepository.findByIdIn(user.getCompanyIds());
    }

    public Company getByIdForActor(String actorId, String companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("empresa no encontrada: " + companyId));

        User user = userRepository.findById(actorId).orElse(null);
        if (user == null) {
            return company;
        }

        if (user.getCompanyIds() == null || !user.getCompanyIds().contains(companyId)) {
            throw new ResourceNotFoundException("empresa no encontrada: " + companyId);
        }

        return company;
    }

    public Company createForActor(String actorId, Company payload) {
        Company created = companyRepository.save(payload);

        User user = userRepository.findById(actorId).orElse(null);
        if (user != null) {
            List<String> ids = user.getCompanyIds();
            if (ids == null) {
                ids = new ArrayList<>();
                user.setCompanyIds(ids);
            }
            if (!ids.contains(created.getId())) {
                ids.add(created.getId());
                userRepository.save(user);
            }
        }

        logService.logUser(actorId, "COMPANY_CREATED", "empresa creada: " + created.getName());
        return created;
    }

    public Company updateForActor(String actorId, String companyId, Company payload) {
        Company existing = getByIdForActor(actorId, companyId);
        existing.setName(payload.getName());
        existing.setTradeName(payload.getTradeName());
        existing.setTaxId(payload.getTaxId());
        existing.setCountry(payload.getCountry());
        existing.setIndustry(payload.getIndustry());
        existing.setWebsite(payload.getWebsite());
        existing.setAddress(payload.getAddress());
        existing.setContact(payload.getContact());
        if (payload.getStatus() != null && !payload.getStatus().isBlank()) {
            existing.setStatus(payload.getStatus());
        }
        logService.logUser(actorId, "COMPANY_UPDATED", "empresa actualizada: " + existing.getName());
        return companyRepository.save(existing);
    }
}
