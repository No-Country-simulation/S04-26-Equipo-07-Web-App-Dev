package com.northpay.backend.config;

import java.util.Properties;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

@Configuration
public class MailConfig {

    @Bean
    @ConditionalOnProperty(name = "app.mail.enabled", havingValue = "true", matchIfMissing = false)
    public JavaMailSender javaMailSender() {

        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();

        mailSender.setHost(System.getenv("MAIL_HOST"));
        mailSender.setPort(Integer.parseInt(System.getenv("MAIL_PORT")));
        mailSender.setUsername(System.getenv("MAIL_USERNAME"));
        mailSender.setPassword(System.getenv("MAIL_PASSWORD"));

        Properties props = mailSender.getJavaMailProperties();

        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.debug", "true");

        return mailSender;
    }
}