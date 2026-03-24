package com.charbel.lifeos.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;

@Configuration
@ConfigurationProperties(prefix = "app")
@Validated
public class AppProps {

    private Jwt jwt = new Jwt();
    private Frontend frontend = new Frontend();

    public Jwt getJwt() {
        return jwt;
    }

    public void setJwt(Jwt jwt) {
        this.jwt = jwt;
    }

    public Frontend getFrontend() {
        return frontend;
    }

    public void setFrontend(Frontend frontend) {
        this.frontend = frontend;
    }

    @Validated
    public static class Jwt {
        @NotBlank
        private String secret;
        private Long expirationMs;

        public String getSecret() { return secret; }
        public void setSecret(String secret) { this.secret = secret; }

        public Long getExpirationMs() { return expirationMs; }
        public void setExpirationMs(Long expirationMs) { this.expirationMs = expirationMs; }
    }

    @Validated
    public static class Frontend {
        @NotBlank
        private String baseUrl;

        public String getBaseUrl() { return baseUrl; }
        public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }
    }
}