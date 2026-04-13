package com.charbel.lifeos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;

public class VerifyRequest {
    @NotBlank(message="L'email est obligatoire")
    @Email(message="Email invalide")
    private String email;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
