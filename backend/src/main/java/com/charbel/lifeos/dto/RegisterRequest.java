package com.charbel.lifeos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
    @NotBlank(message="L'email est obligatoire")
    @Email(message="Email invalide")
    private String email;
    @NotBlank(message="Le mot de passe est obligatoire")
    @Size(min = 10, message="Le mot de passe doit être au minimum de 10 caractères")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[_@$!%*?&])[A-Za-z\\d_@$!%*?&]{10,}$", message = "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial (_@$!%*?&)")
    private String password;

    public String getEmail(){
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword(){
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}