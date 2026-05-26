package com.northpay.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    // notifica a un usuario especifico sobre cambios en su solicitud
    public void notifyUser(String userId, Object payload) {
        messagingTemplate.convertAndSend("/topic/user/" + userId + "/status", payload);
    }

    // notifica a todos los trabajadores sobre nuevas solicitudes o cambios
    public void notifyWorkers(Object payload) {
        messagingTemplate.convertAndSend("/topic/worker/requests", payload);
    }
}
