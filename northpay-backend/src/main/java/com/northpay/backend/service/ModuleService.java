package com.northpay.backend.service;

import com.northpay.backend.dto.module.CreateModuleRequest;
import com.northpay.backend.exception.ResourceNotFoundException;
import com.northpay.backend.model.AppModule;
import com.northpay.backend.repository.AppModuleRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ModuleService {

    private final AppModuleRepository moduleRepository;

    // siembra los modulos del sistema si no existen al arrancar
    @PostConstruct
    public void seedDefaultModules() {
        if (moduleRepository.count() > 0) return;

        log.info("inicializando modulos del sistema");

        createModule("Dashboard", "panel principal de gestion", "/worker/dashboard", "LayoutDashboard", "gestion", 1);
        createModule("Solicitudes", "revision de onboarding de usuarios", "/worker/requests", "ClipboardList", "gestion", 2);
        createModule("Trabajadores", "gestion de trabajadores internos", "/worker/workers", "Users", "gestion", 3);
        createModule("Roles", "gestion de roles y permisos", "/worker/roles", "Shield", "gestion", 4);
        createModule("Modulos", "gestion de modulos del sistema", "/worker/modules", "LayoutGrid", "gestion", 5);
        createModule("Convocatorias", "gestion de convocatorias activas", "/worker/convocatorias", "Megaphone", "gestion", 6);
        createModule("Logs Usuarios", "registro de actividad de usuarios", "/worker/logs/users", "ScrollText", "sistema", 1);
        createModule("Logs Trabajadores", "registro de actividad de trabajadores", "/worker/logs/workers", "ScrollText", "sistema", 2);
    }

    private void createModule(String title, String desc, String path, String icon, String group, int order) {
        AppModule m = new AppModule();
        m.setTitle(title);
        m.setDescription(desc);
        m.setPath(path);
        m.setIcon(icon);
        m.setGroup(group);
        m.setOrder(order);
        moduleRepository.save(m);
    }

    public List<AppModule> findAll() {
        return moduleRepository.findByActiveTrue();
    }

    public List<AppModule> findByGroup(String group) {
        return moduleRepository.findByGroupOrderByOrderAsc(group);
    }

    public AppModule create(CreateModuleRequest req) {
        AppModule module = new AppModule();
        module.setTitle(req.getTitle());
        module.setDescription(req.getDescription());
        module.setPath(req.getPath());
        module.setIcon(req.getIcon());
        module.setGroup(req.getGroup());
        module.setOrder(req.getOrder());
        return moduleRepository.save(module);
    }

    public AppModule update(String id, CreateModuleRequest req) {
        AppModule module = moduleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("modulo no encontrado: " + id));
        module.setTitle(req.getTitle());
        module.setDescription(req.getDescription());
        module.setPath(req.getPath());
        module.setIcon(req.getIcon());
        module.setGroup(req.getGroup());
        module.setOrder(req.getOrder());
        return moduleRepository.save(module);
    }

    public void delete(String id) {
        moduleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("modulo no encontrado: " + id));
        moduleRepository.deleteById(id);
    }
}
