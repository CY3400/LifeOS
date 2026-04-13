package com.charbel.lifeos.dto;

public class AuthResult {
    private AuthResponse response;
    private String token;

    public AuthResponse getResponse(){
        return response;
    }

    public void setResponse(AuthResponse response) {
        this.response = response;
    }

    public String getToken(){
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
