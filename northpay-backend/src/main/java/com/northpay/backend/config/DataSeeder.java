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
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedModules();
        seedRoles();
        seedWorkers();
        seedUsers();
        seedLogs();
        log.info("seed data initialized");
    }

    // ─── modules ────────────────────────────────────────────────────────────────

    private void seedModules() {
        if (appModuleRepository.count() > 0) return;
        appModuleRepository.saveAll(Arrays.asList(
            buildModule("Solicitudes",      "gestion de solicitudes de onboarding",      "/worker/requests",       "ClipboardList", "gestion", 1),
            buildModule("Trabajadores",     "gestion del equipo interno",                "/worker/workers",        "Users",         "gestion", 2),
            buildModule("Personas",         "directorio de usuarios registrados",         "/worker/personas",       "Users",         "gestion", 3),
            buildModule("Convocatorias",    "publicacion de convocatorias laborales",     "/worker/convocatorias",  "Megaphone",     "gestion", 4),
            buildModule("Roles",            "administracion de roles y permisos",         "/worker/roles",          "Shield",        "sistema", 1),
            buildModule("Modulos",          "gestion de modulos del sistema",             "/worker/modules",        "LayoutGrid",    "sistema", 2),
            buildModule("Logs Usuarios",    "registros de actividad de usuarios",         "/worker/logs/users",     "ScrollText",    "sistema", 3),
            buildModule("Logs Trabajadores","registros de actividad del equipo",          "/worker/logs/workers",   "ScrollText",    "sistema", 4)
        ));
        log.info("modules seeded");
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
        if (workerRepository.count() > 0) return;

        List<Role> roles = roleRepository.findAll();
        List<String> allRoleIds   = roles.stream().map(Role::getId).toList();
        List<String> revisorIds   = roles.stream().filter(r -> "REVISOR".equals(r.getName())).map(Role::getId).toList();

        Worker admin = new Worker();
        admin.setFirstName("Admin");
        admin.setLastName("NorthPay");
        admin.setEmail("admin@northpay.com");
        admin.setPassword(passwordEncoder.encode("Admin1234!"));
        admin.setRoleIds(allRoleIds);
        admin.setStatus("active");

        Worker carlos = new Worker();
        carlos.setFirstName("Carlos");
        carlos.setLastName("Mendoza");
        carlos.setEmail("carlos.mendoza@northpay.com");
        carlos.setPassword(passwordEncoder.encode("Revisor1234!"));
        carlos.setRoleIds(revisorIds);
        carlos.setStatus("active");

        workerRepository.saveAll(Arrays.asList(admin, carlos));
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
