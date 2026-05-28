package com.northpay.backend.config;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class StripeConfig {

    @Value("${stripe.api-key}")
    private String apiKey;

    // configura la api key de stripe al iniciar la aplicacion
    @PostConstruct
    public void init() {
        Stripe.apiKey = apiKey;
        log.info("stripe api key configurada");
    }
}
