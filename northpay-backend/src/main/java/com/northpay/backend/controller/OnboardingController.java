package com.northpay.backend.controller;

import com.northpay.backend.dto.onboarding.OnboardingRequest;
import com.northpay.backend.model.Contractor;
import com.northpay.backend.model.OnboardingRequest.DocumentReview;
import com.northpay.backend.model.OnboardingRequest.ActionEntry;
import com.northpay.backend.model.OnboardingRequest.InformationReview;
import com.northpay.backend.model.User;
import com.northpay.backend.repository.ContractorRepository;
import com.northpay.backend.repository.OnboardingRequestRepository;
import com.northpay.backend.repository.UserRepository;
import com.northpay.backend.service.InvitationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/onboarding")
public class OnboardingController {

    @Autowired
    private ContractorRepository contractorRepository;

    @Autowired
    private InvitationService invitationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OnboardingRequestRepository onboardingRequestRepository;

    @PostMapping
    public ResponseEntity<Contractor> submitOnboarding(@RequestBody OnboardingRequest req) {
        Contractor contractor = new Contractor();

        OnboardingRequest.PersonalInfo p = req.getPersonalInfo();
        contractor.setFullName(p.getFullName());
        contractor.setEmail(p.getEmail());
        contractor.setCountry(p.getCountry());
        contractor.setPhone(p.getPhone());
        contractor.setPhoneCode(p.getPhoneCode());
        contractor.setDateOfBirth(p.getDateOfBirth());
        contractor.setAddress(p.getAddress());
        contractor.setCity(p.getCity());
        contractor.setState(p.getState());
        contractor.setZipCode(p.getZipCode());

        Map<String, String> docs = new HashMap<>();
        for (OnboardingRequest.DocumentInfo doc : req.getDocuments()) {
            if (doc.getUrl() != null) {
                docs.put(doc.getId(), doc.getUrl());
            }
        }
        contractor.setDocuments(docs);

        OnboardingRequest.ContractInfo c = req.getContract();
        contractor.setContractSigned(c.isAccepted());
        contractor.setSignature(c.getSignature());
        contractor.setSignedAt(c.getSignedAt());

        OnboardingRequest.PaymentInfo pm = req.getPayment();
        Map<String, String> paymentDetails = new HashMap<>();
        paymentDetails.put("bankName", pm.getBankName());
        paymentDetails.put("accountType", pm.getAccountType());
        paymentDetails.put("accountNumber", pm.getAccountNumber());
        paymentDetails.put("routingNumber", pm.getRoutingNumber());
        paymentDetails.put("currency", pm.getCurrency());
        contractor.setPaymentMethod(paymentDetails);

        contractor.setStatus("PENDING_VERIFICATION");
        Contractor saved = contractorRepository.save(contractor);

        // Crear o actualizar User y OnboardingRequest para el panel trabajador
        if (p.getEmail() != null) {
            User user = userRepository.findByEmail(p.getEmail()).orElseGet(() -> {
                User newUser = new User();
                String[] names = p.getFullName() != null ? p.getFullName().split(" ", 2) : new String[]{p.getEmail(), ""};
                newUser.setFirstName(names[0]);
                newUser.setLastName(names.length > 1 ? names[1] : "");
                newUser.setEmail(p.getEmail());
                newUser.setPhone(p.getPhone());
                newUser.setStatus("pending");
                return userRepository.save(newUser);
            });

            com.northpay.backend.model.OnboardingRequest request =
                onboardingRequestRepository.findByUserId(user.getId()).orElseGet(() -> {
                    com.northpay.backend.model.OnboardingRequest r = new com.northpay.backend.model.OnboardingRequest();
                    r.setUserId(user.getId());
                    return r;
                });

            request.setFullName(p.getFullName());
            request.setEmail(p.getEmail());
            request.setPhone(p.getPhone());
            request.setPhoneCode(p.getPhoneCode());
            request.setDateOfBirth(p.getDateOfBirth());
            request.setAddress(p.getAddress());
            request.setCity(p.getCity());
            request.setState(p.getState());
            request.setZipCode(p.getZipCode());
            request.setCountry(p.getCountry());

            List<InformationReview> infoReviews = new ArrayList<>();
            if (p.getFullName() != null) { InformationReview ir = new InformationReview(); ir.setField("fullName"); ir.setValue(p.getFullName()); ir.setStatus("PENDING"); infoReviews.add(ir); }
            if (p.getEmail() != null) { InformationReview ir = new InformationReview(); ir.setField("email"); ir.setValue(p.getEmail()); ir.setStatus("PENDING"); infoReviews.add(ir); }
            if (p.getPhone() != null) { InformationReview ir = new InformationReview(); ir.setField("phone"); ir.setValue(p.getPhone()); ir.setStatus("PENDING"); infoReviews.add(ir); }
            if (p.getDateOfBirth() != null) { InformationReview ir = new InformationReview(); ir.setField("dateOfBirth"); ir.setValue(p.getDateOfBirth()); ir.setStatus("PENDING"); infoReviews.add(ir); }
            if (p.getAddress() != null) { InformationReview ir = new InformationReview(); ir.setField("address"); ir.setValue(p.getAddress()); ir.setStatus("PENDING"); infoReviews.add(ir); }
            if (p.getCity() != null) { InformationReview ir = new InformationReview(); ir.setField("city"); ir.setValue(p.getCity()); ir.setStatus("PENDING"); infoReviews.add(ir); }
            if (p.getState() != null) { InformationReview ir = new InformationReview(); ir.setField("state"); ir.setValue(p.getState()); ir.setStatus("PENDING"); infoReviews.add(ir); }
            if (p.getZipCode() != null) { InformationReview ir = new InformationReview(); ir.setField("zipCode"); ir.setValue(p.getZipCode()); ir.setStatus("PENDING"); infoReviews.add(ir); }
            if (p.getCountry() != null) { InformationReview ir = new InformationReview(); ir.setField("country"); ir.setValue(p.getCountry()); ir.setStatus("PENDING"); infoReviews.add(ir); }
            request.setInformationReviews(infoReviews);

            List<DocumentReview> reviews = new ArrayList<>();
            for (OnboardingRequest.DocumentInfo doc : req.getDocuments()) {
                if (doc.getId() != null && doc.getUrl() != null) {
                    DocumentReview review = new DocumentReview();
                    review.setDocumentKey(doc.getId());
                    review.setName(doc.getName());
                    review.setUrl(doc.getUrl());
                    review.setFileName(doc.getFileName());
                    review.setStatus("PENDING");
                    reviews.add(review);
                }
            }
            request.setDocumentReviews(reviews);

            ActionEntry entry = new ActionEntry();
            entry.setAction("SUBMITTED");
            entry.setNotes("el contratista completo su onboarding y esta pendiente de revision");
            entry.setTimestamp(LocalDateTime.now());
            List<ActionEntry> history = new ArrayList<>();
            history.add(entry);
            request.setActionHistory(history);

            onboardingRequestRepository.save(request);
        }

        // Marcar la invitacion como completada
        if (p.getEmail() != null) {
            invitationService.completeOnboarding(p.getEmail());
        }

        return ResponseEntity.ok(saved);
    }
}
