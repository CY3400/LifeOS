package com.charbel.lifeos.dto;

public class AuthResult {
    private AuthResponse authResponse;
    private String token;

    public AuthResponse getResponse(){
        return authResponse;
    }

    public void setResponse(AuthResponse authResponse) {
        this.authResponse = authResponse;
    }

    public String getToken(){
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
