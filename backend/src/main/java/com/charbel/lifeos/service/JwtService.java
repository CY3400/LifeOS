package com.charbel.lifeos.service;

import com.charbel.lifeos.config.AppProps;
import com.charbel.lifeos.exception.AppConfigurationException;
import com.charbel.lifeos.exception.BadRequestException;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;

import java.time.Clock;
import java.util.Date;
import java.util.Objects;
import java.util.function.Function;

@Service
public class JwtService {
    private final AppProps props;
    private final Clock clock;

    @Autowired
    public JwtService(AppProps props) {
        this(props, Clock.systemUTC());
    }

    public JwtService(AppProps props, Clock clock) {
        this.props = Objects.requireNonNull(props);
        this.clock = Objects.requireNonNull(clock);

        ensureStrongKey();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(props.getJwt().getSecret());
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private void ensureStrongKey() {
        try {
            byte[] keyBytes = Decoders.BASE64.decode(props.getJwt().getSecret());

            if (keyBytes.length < 32) {
                throw new AppConfigurationException("app.jwt.secret doit être une clé Base64 d'au moins 256 bits (32 octets).");
            }
        } catch (IllegalArgumentException ex) {
            throw new AppConfigurationException("app.jwt.secret doit être une clé Base64 valide.");
        }
    }

    private long expirationMs() {
        return props.getJwt().getExpirationMs() != null ? props.getJwt().getExpirationMs() : 24 * 60 * 60 * 1000L;
    }

    public String generateToken(String subjectEmail, String subjectRole) {
        long now = clock.millis();
        return Jwts.builder()
                .subject(subjectEmail)
                .claim("role", subjectRole)
                .issuedAt(new Date(now))
                .expiration(new Date(now + expirationMs()))
                .signWith(getSigningKey())
                .compact();
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        try {
            Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

            return claimsResolver.apply(claims);
        }
        catch (JwtException | IllegalArgumentException ex) {
            throw new BadRequestException("JWT invalide: " + ex.getMessage());
        }
    }

    public String extractEmail(String token) {
        return extractClaim(token, claims -> claims.getSubject());
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public boolean isTokenValid(String token, String expectedEmail) {
        try {
            String subject = extractEmail(token);
            return expectedEmail.equalsIgnoreCase(subject) && !isTokenExpired(token);
        }
        catch (BadRequestException ex) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        Date exp = extractClaim(token, claims -> claims.getExpiration());
        return exp.before(new Date(clock.millis()));
    }

    public boolean isAboutToExpire(String token, long thresholdMs) {
        Date exp = extractClaim(token, claims -> claims.getExpiration());
        long remaining = exp.getTime() - clock.millis();
        return remaining <= thresholdMs;
    }
}