package com.charbel.lifeos.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.charbel.lifeos.dto.UserSessionResponse;
import com.charbel.lifeos.dto.AuthResult;
import com.charbel.lifeos.dto.LoginRequest;
import com.charbel.lifeos.dto.RegisterRequest;
import com.charbel.lifeos.dto.VerifyRequest;
import com.charbel.lifeos.entity.User;
import com.charbel.lifeos.service.AuthService;
import com.charbel.lifeos.service.CurrentUserService;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private static final int COOKIE_AGE_SECONDS = 86400;
    private final CurrentUserService currentUserService;

    public AuthController(AuthService authService, CurrentUserService currentUserService) {
        this.authService = authService;
        this.currentUserService = currentUserService;
    }

    private void setCookie(HttpServletResponse response, String value, int maxAgeSeconds) {
        ResponseCookie cookie = ResponseCookie.from("jwt_token", value == null ? "" : value)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(maxAgeSeconds)
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    @PostMapping("/register")
    public ResponseEntity<UserSessionResponse> register(@Valid @RequestBody RegisterRequest request, HttpServletResponse response) {
        AuthResult result = authService.register(request);

        String cookie = result.getToken();

        setCookie(response, cookie, COOKIE_AGE_SECONDS);

        return ResponseEntity.status(201).body(result.getResponse());
    }

    @PostMapping("/login")
    public ResponseEntity<UserSessionResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        AuthResult result = authService.login(request);

        String cookie = result.getToken();

        setCookie(response, cookie, COOKIE_AGE_SECONDS);

        return ResponseEntity.ok(result.getResponse());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        setCookie(response, null, 0);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/verify")
    public ResponseEntity<Boolean> verify(@Valid @RequestBody VerifyRequest res) {
        Boolean response = authService.verify(res.getEmail());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserSessionResponse> me(Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);

        UserSessionResponse response = new UserSessionResponse();

        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setUserId(user.getId());

        return ResponseEntity.ok(response);
    }
}
