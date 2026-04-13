package com.charbel.lifeos.service;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.charbel.lifeos.entity.User;
import com.charbel.lifeos.entity.UserPrincipal;
import com.charbel.lifeos.exception.BadRequestException;
import com.charbel.lifeos.exception.InvalidCredentialsException;

@Service
public class CurrentUserService {
    public User getCurrentUser(Authentication auth) {
        if(auth == null || !auth.isAuthenticated()) {
            throw new InvalidCredentialsException("Utilisateur non authentifié");
        }

        Object principal = auth.getPrincipal();
        if(!(principal instanceof UserPrincipal userPrincipal)) {
            throw new BadRequestException("Principal utilisateur invalide");
        }
        
        return userPrincipal.getUser();
    }
}
