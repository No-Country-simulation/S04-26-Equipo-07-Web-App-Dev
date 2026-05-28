package com.northpay.backend.dto.onboarding;

import lombok.Data;
import java.util.List;

@Data
public class OnboardingRequest {
    private PersonalInfo personalInfo;
    private List<DocumentInfo> documents;
    private ContractInfo contract;
    private PaymentInfo payment;

    @Data
    public static class PersonalInfo {
        private String fullName;
        private String email;
        private String phone;
        private String phoneCode;
        private String dateOfBirth;
        private String address;
        private String city;
        private String state;
        private String zipCode;
        private String country;
    }

    @Data
    public static class DocumentInfo {
        private String id;
        private String name;
        private String fileName;
        private boolean uploaded;
        private String url;
    }

    @Data
    public static class ContractInfo {
        private boolean accepted;
        private String signature;
        private String signedAt;
    }

    @Data
    public static class PaymentInfo {
        private String bankName;
        private String accountType;
        private String accountNumber;
        private String routingNumber;
        private String currency;
    }
}
