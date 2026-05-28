package com.northpay.backend.config;

import com.northpay.backend.model.*;
import com.northpay.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.ArrayList;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final WorkerRepository workerRepository;
    private final UserRepository userRepository;
    private final WorkerLogRepository workerLogRepository;
    private final UserLogRepository userLogRepository;
    private final AppModuleRepository appModuleRepository;
    private final CompanyRepository companyRepository;
    private final PaymentRepository paymentRepository;
    private final ConvocatoriaRepository convocatoriaRepository;
    private final OnboardingRequestRepository onboardingRequestRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedModules();
        seedRoles();
        seedWorkers();
        seedUsers();
        seedCompanies();
        seedPayments();
        seedConvocatorias();
        seedOnboardingRequests();
        seedLogs();
        log.info("seed data initialized");
    }

    // ─── modules ────────────────────────────────────────────────────────────────

    private void seedModules() {
        upsertModule("Solicitudes",       "gestion de solicitudes de onboarding",    "/worker/requests",       "ClipboardList", "gestion", 1);
        upsertModule("Trabajadores",      "gestion del equipo interno",              "/worker/workers",        "Users",         "gestion", 2);
        upsertModule("Personas",          "directorio de usuarios registrados",       "/worker/personas",       "Users",         "gestion", 3);
        upsertModule("Clientes",          "gestion de clientes e invitaciones",        "/worker/clientes",       "UserRoundPlus", "gestion", 4);
        upsertModule("Convocatorias",     "publicacion de convocatorias laborales",   "/worker/convocatorias",  "Megaphone",     "gestion", 5);
        upsertModule("Movimientos",       "consulta de transacciones de usuarios",     "/worker/movimientos",    "ArrowLeftRight", "gestion", 6);
        upsertModule("Roles",             "administracion de roles y permisos",       "/worker/roles",          "Shield",        "sistema", 1);
        upsertModule("Modulos",           "gestion de modulos del sistema",           "/worker/modules",        "LayoutGrid",    "sistema", 2);
        upsertModule("Logs Usuarios",     "registros de actividad de usuarios",       "/worker/logs/users",     "ScrollText",    "sistema", 3);
        upsertModule("Logs Trabajadores", "registros de actividad del equipo",        "/worker/logs/workers",   "ScrollText",    "sistema", 4);
        log.info("modules seeded");
    }

    private void upsertModule(String title, String desc, String path, String icon, String group, int order) {
        AppModule module = appModuleRepository.findByPath(path).orElse(new AppModule());
        module.setTitle(title);
        module.setDescription(desc);
        module.setPath(path);
        module.setIcon(icon);
        module.setGroup(group);
        module.setOrder(order);
        module.setActive(true);
        appModuleRepository.save(module);
    }

    private AppModule buildModule(String title, String desc, String path, String icon, String group, int order) {
        AppModule m = new AppModule();
        m.setTitle(title);
        m.setDescription(desc);
        m.setPath(path);
        m.setIcon(icon);
        m.setGroup(group);
        m.setOrder(order);
        m.setActive(true);
        return m;
    }

    // ─── roles ──────────────────────────────────────────────────────────────────

    private void seedRoles() {
        if (roleRepository.count() > 0) return;

        Role revisor = new Role();
        revisor.setName("REVISOR");
        revisor.setDescription("revisa y valida documentos de onboarding");

        Role supervisor = new Role();
        supervisor.setName("SUPERVISOR");
        supervisor.setDescription("supervisa el equipo y aprueba solicitudes");

        Role adminOp = new Role();
        adminOp.setName("ADMIN_OP");
        adminOp.setDescription("acceso completo al panel operativo");

        roleRepository.saveAll(Arrays.asList(revisor, supervisor, adminOp));
        log.info("roles seeded");
    }

    // ─── workers ────────────────────────────────────────────────────────────────

    private void seedWorkers() {
        List<Role> roles = roleRepository.findAll();
        List<String> allRoleIds = roles.stream().map(Role::getId).toList();
        List<String> revisorIds = roles.stream().filter(r -> "REVISOR".equals(r.getName())).map(Role::getId).toList();

        // upsert by email: overrides the auto-admin created by @PostConstruct
        Worker admin = workerRepository.findByEmail("admin@northpay.com").orElse(new Worker());
        admin.setFirstName("Admin");
        admin.setLastName("NorthPay");
        admin.setEmail("admin@northpay.com");
        admin.setPassword(passwordEncoder.encode("Admin1234!"));
        admin.setRoleIds(allRoleIds);
        admin.setStatus("active");
        workerRepository.save(admin);

        if (workerRepository.findByEmail("carlos.mendoza@northpay.com").isEmpty()) {
            Worker carlos = new Worker();
            carlos.setFirstName("Carlos");
            carlos.setLastName("Mendoza");
            carlos.setEmail("carlos.mendoza@northpay.com");
            carlos.setPassword(passwordEncoder.encode("Revisor1234!"));
            carlos.setRoleIds(revisorIds);
            carlos.setStatus("active");
            workerRepository.save(carlos);
        }

        log.info("workers seeded");
    }

    // ─── users ──────────────────────────────────────────────────────────────────

    private void seedUsers() {
        if (userRepository.count() > 0) return;

        User u1 = new User();
        u1.setFirstName("Rolando");
        u1.setLastName("Hermesto");
        u1.setEmail("rolando.hermesto@example.com");
        u1.setPhone("+51 999 999 999");
        u1.setBirthDate(LocalDate.of(1990, 5, 15));
        u1.setStatus("active");
        u1.setCredits(50.0);
        u1.setPassword(passwordEncoder.encode("User1234!"));
        User.DocumentInfo doc1 = new User.DocumentInfo();
        doc1.setType("DNI");
        doc1.setNumber("12345678");
        u1.setDocument(doc1);
        User.Address addr1 = new User.Address();
        addr1.setCountry("Peru");
        addr1.setCity("Lima");
        addr1.setStreet("Av. Principal 456");
        u1.setAddress(addr1);

        User u2 = new User();
        u2.setFirstName("Maria");
        u2.setLastName("Santos");
        u2.setEmail("maria.santos@example.com");
        u2.setPhone("+51 888 888 888");
        u2.setBirthDate(LocalDate.of(1992, 8, 22));
        u2.setStatus("active");
        u2.setCredits(120.0);
        u2.setPassword(passwordEncoder.encode("User1234!"));
        User.DocumentInfo doc2 = new User.DocumentInfo();
        doc2.setType("DNI");
        doc2.setNumber("87654321");
        u2.setDocument(doc2);
        User.Address addr2 = new User.Address();
        addr2.setCountry("Peru");
        addr2.setCity("Arequipa");
        addr2.setStreet("Calle Los Pinos 789");
        u2.setAddress(addr2);

        userRepository.saveAll(Arrays.asList(u1, u2));
        log.info("users seeded");
    }

    // ─── companies ──────────────────────────────────────────────────────────────

    private void seedCompanies() {
        if (companyRepository.count() == 0) {
            List<User> users = userRepository.findAll();
            if (users.isEmpty()) return;
            String uId1 = users.get(0).getId();
            String uId2 = users.size() > 1 ? users.get(1).getId() : uId1;

            companyRepository.saveAll(Arrays.asList(
                buildCompany(uId1, "TechSolutions SAC", "TechSol",    "20601234567", "Peru",  "Tecnologia",   "Lima",     "Av. Innovacion 123"),
                buildCompany(uId1, "LogiPeru S.A.",     "LogiPeru",   "20607654321", "Peru",  "Logistica",    "Callao",   "Jr. Puerto 456"),
                buildCompany(uId2, "Andina Exports SRL","AndExports",  "20609988776", "Peru",  "Exportacion",  "Arequipa", "Calle Comercio 789")
            ));
            log.info("companies seeded");
        }

        // mantiene consistencia entre users.companyIds y companies existentes
        List<User> users = userRepository.findAll();
        List<Company> companies = companyRepository.findAll();
        if (!users.isEmpty() && !companies.isEmpty()) {
            User first = users.get(0);
            List<String> firstIds = new ArrayList<>();
            firstIds.add(companies.get(0).getId());
            if (companies.size() > 1) firstIds.add(companies.get(1).getId());
            first.setCompanyIds(firstIds);
            userRepository.save(first);

            if (users.size() > 1) {
                User second = users.get(1);
                List<String> secondIds = new ArrayList<>();
                String companyId = companies.size() > 2 ? companies.get(2).getId() : companies.get(0).getId();
                secondIds.add(companyId);
                second.setCompanyIds(secondIds);
                userRepository.save(second);
            }
        }
    }

    private Company buildCompany(String userId, String name, String tradeName, String taxId,
                                  String country, String industry, String city, String street) {
        Company c = new Company();
        c.setName(name);
        c.setTradeName(tradeName);
        c.setTaxId(taxId);
        c.setCountry(country);
        c.setIndustry(industry);
        c.setStatus("active");
        Company.Address addr = new Company.Address();
        addr.setCity(city);
        addr.setStreet(street);
        c.setAddress(addr);
        return c;
    }

    // ─── payments ───────────────────────────────────────────────────────────────

    private void seedPayments() {
        if (paymentRepository.count() > 0) return;

        List<User> users = userRepository.findAll();
        if (users.isEmpty()) return;
        String uId1 = users.get(0).getId();
        String uId2 = users.size() > 1 ? users.get(1).getId() : uId1;

        paymentRepository.saveAll(Arrays.asList(
            buildPayment(uId1, 50.00,  "ACCEPTED",  "pi_seed_001"),
            buildPayment(uId1, 25.00,  "ACCEPTED",  "pi_seed_002"),
            buildPayment(uId1, 10.00,  "CANCELLED", "pi_seed_003"),
            buildPayment(uId2, 120.00, "ACCEPTED",  "pi_seed_004"),
            buildPayment(uId2, 30.00,  "PENDING",   "pi_seed_005")
        ));
        log.info("payments seeded");
    }

    private Payment buildPayment(String userId, double amount, String status, String intentId) {
        Payment p = new Payment();
        p.setUserId(userId);
        p.setAmount(amount);
        p.setCurrency("USD");
        p.setStatus(status);
        p.setStripePaymentIntentId(intentId);
        return p;
    }

    // ─── convocatorias ──────────────────────────────────────────────────────────

    private void seedConvocatorias() {
        if (convocatoriaRepository.count() > 0) return;

        List<Company> companies = companyRepository.findAll();
        if (companies.isEmpty()) return;
        String cId1 = companies.get(0).getId();
        String cId2 = companies.size() > 1 ? companies.get(1).getId() : cId1;
        String cId3 = companies.size() > 2 ? companies.get(2).getId() : cId1;

        List<User> users = userRepository.findAll();
        String uId1 = users.isEmpty() ? null : users.get(0).getId();

        convocatoriaRepository.saveAll(Arrays.asList(
            buildConvocatoria(cId1, uId1, "Desarrollador Backend Java",
                "Buscamos desarrollador Java con experiencia en Spring Boot y MongoDB.",
                "Lima, Peru", "remote",  "full-time",  5.0, "ACTIVE"),
            buildConvocatoria(cId2, uId1, "Analista de Logistica",
                "Posicion para analista con conocimiento en cadena de suministro.",
                "Callao, Peru", "on-site", "full-time",  5.0, "ACTIVE"),
            buildConvocatoria(cId3, uId1, "Asistente Comercial Exportaciones",
                "Se requiere asistente con ingles avanzado para area de exportaciones.",
                "Arequipa, Peru", "hybrid", "part-time", 5.0, "DRAFT")
        ));
        log.info("convocatorias seeded");
    }

    private Convocatoria buildConvocatoria(String companyId, String createdBy, String title,
                                            String description, String location,
                                            String modality, String contractType,
                                            double creditCost, String status) {
        Convocatoria cv = new Convocatoria();
        cv.setCompanyId(companyId);
        cv.setCreatedBy(createdBy);
        cv.setTitle(title);
        cv.setDescription(description);
        cv.setLocation(location);
        cv.setModality(modality);
        cv.setContractType(contractType);
        cv.setCreditCost(creditCost);
        cv.setStatus(status);
        return cv;
    }

    // ─── onboarding requests ────────────────────────────────────────────────────

    private void seedOnboardingRequests() {
        if (onboardingRequestRepository.count() > 0) return;

        List<User> users = userRepository.findAll();
        if (users.isEmpty()) return;
        String uId1 = users.get(0).getId();
        String uId2 = users.size() > 1 ? users.get(1).getId() : uId1;

        List<Worker> workers = workerRepository.findAll();
        String wId = workers.isEmpty() ? null : workers.get(0).getId();

        // onboarding aprobado para u1
        OnboardingRequest req1 = new OnboardingRequest();
        req1.setUserId(uId1);
        req1.setAssignedWorkerId(wId);
        req1.setStatus("APPROVED");
        List<OnboardingRequest.DocumentReview> reviews1 = new ArrayList<>();
        reviews1.add(buildDocReview("dni",    "APPROVED", "documento claro y vigente",      wId));
        reviews1.add(buildDocReview("tax_id", "APPROVED", "ruc validado correctamente",      wId));
        req1.setDocumentReviews(reviews1);
        List<OnboardingRequest.ActionEntry> history1 = new ArrayList<>();
        history1.add(buildAction(wId, "ASSIGN",  "solicitud asignada al revisor",     72));
        history1.add(buildAction(wId, "APPROVE", "onboarding aprobado sin observaciones", 6));
        req1.setActionHistory(history1);

        // onboarding en revision para u2
        OnboardingRequest req2 = new OnboardingRequest();
        req2.setUserId(uId2);
        req2.setAssignedWorkerId(wId);
        req2.setStatus("IN_REVIEW");
        List<OnboardingRequest.DocumentReview> reviews2 = new ArrayList<>();
        reviews2.add(buildDocReview("dni",    "APPROVED", "documento valido",     wId));
        reviews2.add(buildDocReview("tax_id", "PENDING",  null,                   null));
        req2.setDocumentReviews(reviews2);
        List<OnboardingRequest.ActionEntry> history2 = new ArrayList<>();
        history2.add(buildAction(wId, "ASSIGN", "solicitud asignada para revision", 10));
        req2.setActionHistory(history2);

        onboardingRequestRepository.saveAll(Arrays.asList(req1, req2));
        log.info("onboarding requests seeded");
    }

    private OnboardingRequest.DocumentReview buildDocReview(String key, String status,
                                                             String observation, String reviewedBy) {
        OnboardingRequest.DocumentReview dr = new OnboardingRequest.DocumentReview();
        dr.setDocumentKey(key);
        dr.setStatus(status);
        dr.setObservation(observation);
        dr.setReviewedBy(reviewedBy);
        if (!"PENDING".equals(status)) dr.setReviewedAt(LocalDateTime.now().minusHours(12));
        return dr;
    }

    private OnboardingRequest.ActionEntry buildAction(String workerId, String action,
                                                       String notes, long hoursAgo) {
        OnboardingRequest.ActionEntry entry = new OnboardingRequest.ActionEntry();
        entry.setWorkerId(workerId);
        entry.setAction(action);
        entry.setNotes(notes);
        entry.setTimestamp(LocalDateTime.now().minusHours(hoursAgo));
        return entry;
    }

    // ─── logs ───────────────────────────────────────────────────────────────────

    private void seedLogs() {
        if (workerLogRepository.count() > 5) return;

        List<Worker> workers = workerRepository.findAll();
        if (workers.isEmpty()) return;
        String wId1 = workers.get(0).getId();
        String wId2 = workers.size() > 1 ? workers.get(1).getId() : wId1;

        workerLogRepository.saveAll(Arrays.asList(
            wlog(wId1, "LOGIN",            "inicio de sesion",                     48),
            wlog(wId1, "ASSIGN_REQUEST",   "solicitud NP-00192 asignada",          36),
            wlog(wId1, "APPROVE_DOCUMENT", "DNI aprobado para rolando.hermesto",   24),
            wlog(wId2, "LOGIN",            "inicio de sesion",                     20),
            wlog(wId2, "REJECT_DOCUMENT",  "documento rechazado: imagen borrosa",  18),
            wlog(wId2, "UPDATE_STATUS",    "solicitud actualizada a EN_REVISION",  12),
            wlog(wId1, "APPROVE_REQUEST",  "onboarding completado y aprobado",      6),
            wlog(wId1, "LOGOUT",           "cierre de sesion",                      1)
        ));

        List<User> users = userRepository.findAll();
        if (users.isEmpty()) return;
        String uId = users.get(0).getId();

        userLogRepository.saveAll(Arrays.asList(
            ulog(uId, "REGISTER",             "usuario registrado mediante invitacion", 72),
            ulog(uId, "LOGIN",                "inicio de sesion",                       48),
            ulog(uId, "UPLOAD_DOCUMENT",      "documento DNI subido",                   36),
            ulog(uId, "SIGN_CONTRACT",        "contrato firmado digitalmente",           24),
            ulog(uId, "PAYMENT_CREATED",      "pago creado por USD 50.00",              12),
            ulog(uId, "PAYMENT_ACCEPTED",     "pago aceptado por Stripe",               11),
            ulog(uId, "ONBOARDING_SUBMITTED", "onboarding enviado para revision",        6)
        ));

        log.info("logs seeded");
    }

    private WorkerLog wlog(String workerId, String action, String details, long hoursAgo) {
        WorkerLog entry = new WorkerLog();
        entry.setWorkerId(workerId);
        entry.setAction(action);
        entry.setDetails(details);
        entry.setIpAddress("10.0.0.1");
        entry.setTimestamp(LocalDateTime.now().minusHours(hoursAgo));
        return entry;
    }

    private UserLog ulog(String userId, String action, String details, long hoursAgo) {
        UserLog entry = new UserLog();
        entry.setUserId(userId);
        entry.setAction(action);
        entry.setDetails(details);
        entry.setIpAddress("200.10.5.1");
        entry.setTimestamp(LocalDateTime.now().minusHours(hoursAgo));
        return entry;
    }
}
