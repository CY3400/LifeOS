package com.charbel.lifeos.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.charbel.lifeos.entity.Category;
import com.charbel.lifeos.entity.Goal;
import com.charbel.lifeos.entity.Status;
import com.charbel.lifeos.entity.User;
import com.charbel.lifeos.exception.BadRequestException;
import com.charbel.lifeos.exception.ResourceNotFoundException;
import com.charbel.lifeos.repository.CategoryRepository;
import com.charbel.lifeos.repository.GoalRepository;
import com.charbel.lifeos.repository.TaskRepository;

@Service
@Transactional
public class GoalService {
    private final GoalRepository goalRepository;
    private final CategoryRepository categoryRepository;
    private final TaskRepository taskRepository;

    public GoalService(GoalRepository goalRepository, CategoryRepository categoryRepository, TaskRepository taskRepository) {
        this.goalRepository = goalRepository;
        this.categoryRepository = categoryRepository;
        this.taskRepository = taskRepository;
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

    private String normalizeTitle(String title) {
        if (title == null) {
            throw new BadRequestException("Titre requis");
        }

        String normalizedTitle = title.trim().replaceAll("\\s+", " ");

        if (normalizedTitle.isBlank()) {
            throw new BadRequestException("Titre requis");
        }

        return normalizedTitle;
    }

    private void validateGoalIsNotUsed(Long goalId, Long userId) {
        boolean task = taskRepository.existsByGoalIdAndUserId(goalId, userId);

        if(task) {
            throw new BadRequestException("L'objectif est utilisé par une ou plusieurs tâches et ne peut pas être supprimé", "GOAL_USED");
        }
    }

    private Goal resolveGoalForUser(Long id, Long userId) {
        return goalRepository.findByIdAndUserIdAndStatus(id, userId, Status.ACTIVE).orElseThrow(() -> new ResourceNotFoundException("Objectif introuvable"));
    }

    private Category resolveCategoryForUser(Long categoryId, User user) {
        return categoryRepository.findByIdAndUserIdAndStatus(categoryId, user.getId(), Status.ACTIVE).orElseThrow(() -> new ResourceNotFoundException("Catégorie introuvable"));
    }

    public Goal createGoal(User user, String title, Long categoryId) {
        validateUser(user);
        Category category = resolveCategoryForUser(categoryId, user);

        String normalizedTitle = normalizeTitle(title);

        Goal g = new Goal();
        g.setUser(user);
        g.setTitle(normalizedTitle);
        g.setCategory(category);

        return goalRepository.save(g);
    }

    public Goal updateGoal(Long id, User user, String title, Long categoryId) {
        validateUser(user);
        validateGoalId(id);

        Category category = resolveCategoryForUser(categoryId, user);
        String normalizedTitle = normalizeTitle(title);

        Goal existing = resolveGoalForUser(id, user.getId());

        existing.setTitle(normalizedTitle);
        existing.setCategory(category);

        return goalRepository.save(existing);
    }

    public void deleteGoal(Long id, User user) {
        validateUser(user);
        validateGoalId(id);

        Goal existing = resolveGoalForUser(id, user.getId());

        validateGoalIsNotUsed(id, user.getId());

        goalRepository.delete(existing);
    }

    public Goal archiveGoal(User user, Long id) {
        validateUser(user);
        validateGoalId(id);

        Goal existing = resolveGoalForUser(id, user.getId());

        boolean hasActiveTasks = taskRepository.existsByGoalIdAndUserIdAndStatus(id, user.getId(), Status.ACTIVE);

        if(hasActiveTasks) {
            throw new BadRequestException("L'objectif contient des tâches actives", "GOAL_HAS_ACTIVE_TASKS");
        }

        existing.setStatus(Status.ARCHIVED);

        return goalRepository.save(existing);
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
