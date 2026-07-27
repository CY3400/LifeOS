package com.charbel.lifeos.dto;

public class AuthResult {
    private UserSessionResponse response;
    private String token;

    public UserSessionResponse getResponse(){
        return response;
    }

    public void setResponse(UserSessionResponse response) {
        this.response = response;
    }

    public String getToken(){
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
