package com.charbel.lifeos.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.charbel.lifeos.dto.AuthResponse;
import com.charbel.lifeos.dto.AuthResult;
import com.charbel.lifeos.dto.LoginRequest;
import com.charbel.lifeos.dto.RegisterRequest;
import com.charbel.lifeos.service.AuthService;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private static final int COOKIE_AGE_SECONDS = 86400;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    private void setCookie(HttpServletResponse response, String value, int maxAgeSeconds) {
        ResponseCookie cookie = ResponseCookie.from("jwt_token", value == null ? "" : value)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(maxAgeSeconds)
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request, HttpServletResponse response) {
        AuthResult result = authService.register(request);

        String cookie = result.getToken();

        setCookie(response, cookie, COOKIE_AGE_SECONDS);

        return ResponseEntity.status(201).body(result.getResponse());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        AuthResult result = authService.login(request);

        String cookie = result.getToken();

        setCookie(response, cookie, COOKIE_AGE_SECONDS);

        return ResponseEntity.ok(result.getResponse());
    }

    @PostMapping("/logout")
    public void logout(HttpServletResponse response) {
        setCookie(response, null, 0);
        response.setStatus(HttpServletResponse.SC_OK);
    }
}
