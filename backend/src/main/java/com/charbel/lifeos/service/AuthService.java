package com.charbel.lifeos.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.charbel.lifeos.dto.AuthResponse;
import com.charbel.lifeos.dto.LoginRequest;
import com.charbel.lifeos.dto.RegisterRequest;
import com.charbel.lifeos.entity.User;
import com.charbel.lifeos.exception.EmailAlreadyExistsException;
import com.charbel.lifeos.exception.InvalidCredentialsException;
import com.charbel.lifeos.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());
        String rawPassword = request.getPassword() == null ? "" : request.getPassword();

        if(userRepository.existsByEmailIgnoreCase(email)) {
            throw new EmailAlreadyExistsException("Email déjà utilisé");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));

        User savedUser = userRepository.save(user);

        return buildAuthResponse(savedUser, "Inscription réussie");
    }

    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.getEmail());
        String password = request.getPassword() == null ? "" : request.getPassword();
        
        User user = userRepository.findByEmailIgnoreCase(email).orElseThrow(() -> new InvalidCredentialsException("Identifiants invalides"));

        if(!passwordEncoder.matches(password, user.getPassword())) {
            throw new InvalidCredentialsException("Identifiants invalides");
        }

        return buildAuthResponse(user, "Connexion réussie");
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private AuthResponse buildAuthResponse(User user, String message) {
        AuthResponse response = new AuthResponse();
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setMessage(message);
        return response;
    }
}
