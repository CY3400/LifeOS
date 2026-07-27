package com.charbel.lifeos.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.charbel.lifeos.dto.UserSessionResponse;
import com.charbel.lifeos.dto.AuthResult;
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
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResult register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());
        String rawPassword = request.getPassword() == null ? "" : request.getPassword();

        if(userRepository.existsByEmailIgnoreCase(email)) {
            throw new EmailAlreadyExistsException("Email déjà utilisé");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));

        User savedUser = userRepository.save(user);

        UserSessionResponse response =  buildUserSessionResponse(savedUser, "Inscription réussie");

        String token = jwtService.generateToken(savedUser.getEmail(), savedUser.getRole().name());

        return buildAuthResult(response, token);
    }

    public AuthResult login(LoginRequest request) {
        String email = normalizeEmail(request.getEmail());
        String password = request.getPassword() == null ? "" : request.getPassword();
        
        User user = userRepository.findByEmailIgnoreCase(email).orElseThrow(() -> new InvalidCredentialsException("Identifiants invalides"));

        if(!passwordEncoder.matches(password, user.getPassword())) {
            throw new InvalidCredentialsException("Identifiants invalides");
        }

        UserSessionResponse response =  buildUserSessionResponse(user, "Connexion réussie");

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());

        return buildAuthResult(response, token);
    }

    public boolean verify(String email) {
        return !userRepository.existsByEmailIgnoreCase(normalizeEmail(email));
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private UserSessionResponse buildUserSessionResponse(User user, String message) {
        UserSessionResponse response = new UserSessionResponse();
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        return response;
    }

    private AuthResult buildAuthResult(UserSessionResponse response, String token) {
        AuthResult result = new AuthResult();
        result.setToken(token);
        result.setResponse(response);
        return result;
    }
}
