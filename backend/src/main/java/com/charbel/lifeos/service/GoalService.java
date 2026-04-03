package com.charbel.lifeos.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.charbel.lifeos.entity.Goal;
import com.charbel.lifeos.entity.User;
import com.charbel.lifeos.exception.ResourceNotFoundException;
import com.charbel.lifeos.repository.GoalRepository;

@Service
@Transactional
public class GoalService {
    private final GoalRepository goalRepository;

    public GoalService(GoalRepository goalRepository) {
        this.goalRepository = goalRepository;
    }

    public Goal createGoal(User user, String title) {
        if(user == null) {
            throw new IllegalArgumentException("Utilisateur requis");
        }

        if(title == null || title.isBlank()) {
            throw new IllegalArgumentException("Titre requis");
        }

        Goal g = new Goal();
        g.setUser(user);
        g.setTitle(title);

        return goalRepository.save(g);
    }

    public Goal updateGoal(Long id, User user, String title) {
        if(user == null) {
            throw new IllegalArgumentException("Utilisateur requis");
        }

        if(title == null || title.isBlank()) {
            throw new IllegalArgumentException("Titre requis");
        }

        if(id == null) {
            throw new IllegalArgumentException("Identifiant requis");
        }

        Goal existing = goalRepository.findByIdAndUserId(id, user.getId()).orElseThrow(() -> new ResourceNotFoundException("Objectif introuvable"));

        existing.setTitle(title);

        return goalRepository.save(existing);
    }

    @SuppressWarnings("null")
    public void deleteGoal(Long id, User user) {
        if(user == null) {
            throw new IllegalArgumentException("Utilisateur requis");
        }

        if(id == null) {
            throw new IllegalArgumentException("Identifiant requis");
        }

        Goal existing = goalRepository.findByIdAndUserId(id, user.getId()).orElseThrow(() -> new ResourceNotFoundException("Objectif introuvable"));

        goalRepository.delete(existing);
    }

    @Transactional(readOnly = true)
    public List<Goal> getGoalsForUser(User user) {
        if(user == null) {
            throw new IllegalArgumentException("Utilisateur requis");
        }

        return goalRepository.findByUserId(user.getId());
    }

    @Transactional(readOnly = true)
    public Goal getGoalByIdForUser(User user, Long id) {
        if(user == null) {
            throw new IllegalArgumentException("Utilisateur requis");
        }

        if(id == null) {
            throw new IllegalArgumentException("Identifiant requis");
        }

        return goalRepository.findByIdAndUserId(id, user.getId()).orElseThrow(() -> new ResourceNotFoundException("Objectif introuvable"));
    }
}
