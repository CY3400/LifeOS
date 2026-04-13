package com.charbel.lifeos.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.charbel.lifeos.entity.Goal;
import com.charbel.lifeos.entity.User;
import com.charbel.lifeos.exception.BadRequestException;
import com.charbel.lifeos.exception.ResourceNotFoundException;
import com.charbel.lifeos.repository.GoalRepository;

@Service
@Transactional
public class GoalService {
    private final GoalRepository goalRepository;

    public GoalService(GoalRepository goalRepository) {
        this.goalRepository = goalRepository;
    }

    private void validateUser(User user) {
        if(user == null) {
            throw new BadRequestException("Utilisateur requis");
        }
    }

    private void validateGoalId(Long id) {
        if(id == null) {
            throw new BadRequestException("Identifiant requis");
        }
    }

    private void validateTitle(String title) {
        if(title == null || title.isBlank()) {
            throw new BadRequestException("Titre requis");
        }
    }

    private Goal resolveGoalForUser(Long id, Long userId) {
        return goalRepository.findByIdAndUserId(id, userId).orElseThrow(() -> new ResourceNotFoundException("Objectif introuvable"));
    }

    public Goal createGoal(User user, String title) {
        validateUser(user);

        validateTitle(title);

        Goal g = new Goal();
        g.setUser(user);
        g.setTitle(title);

        return goalRepository.save(g);
    }

    public Goal updateGoal(Long id, User user, String title) {
        validateUser(user);

        validateTitle(title);

        validateGoalId(id);

        Goal existing = resolveGoalForUser(id, user.getId());

        existing.setTitle(title);

        return goalRepository.save(existing);
    }

    public void deleteGoal(Long id, User user) {
        validateUser(user);

        validateGoalId(id);

        Goal existing = resolveGoalForUser(id, user.getId());

        goalRepository.delete(existing);
    }

    @Transactional(readOnly = true)
    public List<Goal> getGoalsForUser(User user) {
        validateUser(user);

        return goalRepository.findByUserId(user.getId());
    }

    @Transactional(readOnly = true)
    public Goal getGoalByIdForUser(User user, Long id) {
        validateUser(user);

        validateGoalId(id);

        return resolveGoalForUser(id, user.getId());
    }
}
