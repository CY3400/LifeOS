package com.charbel.lifeos.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.charbel.lifeos.entity.UserPrincipal;
import com.charbel.lifeos.repository.UserRepository;

@Service
@Transactional(readOnly = true)
public class MyUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    public MyUserDetailsService(UserRepository repo){ this.userRepository = repo; }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException{
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase();

        return userRepository.findByEmailIgnoreCase(normalizedEmail).map(UserPrincipal::new).orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable"));
    }
}