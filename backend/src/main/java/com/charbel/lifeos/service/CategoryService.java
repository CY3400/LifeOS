package com.charbel.lifeos.service;

import com.charbel.lifeos.repository.CategoryRepository;
import com.charbel.lifeos.repository.GoalRepository;
import com.charbel.lifeos.repository.TaskRepository;

import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.charbel.lifeos.entity.Category;
import com.charbel.lifeos.entity.Status;
import com.charbel.lifeos.entity.User;
import com.charbel.lifeos.exception.BadRequestException;
import com.charbel.lifeos.exception.ResourceNotFoundException;

@Service
@Transactional
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final TaskRepository taskRepository;
    private final GoalRepository goalRepository;

    public CategoryService(CategoryRepository categoryRepository, TaskRepository taskRepository, GoalRepository goalRepository) {
        this.categoryRepository = categoryRepository;
        this.taskRepository = taskRepository;
        this.goalRepository = goalRepository;
    }

    private void validateUser(User user) {
        if(user == null) {
            throw new BadRequestException("Utilisateur requis");
        }
    }

    private void validateCategoryId(Long id) {
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

    private void validateTitleUniquenessForUser(String title, User user) {
        if(categoryRepository.existsByUserIdAndTitle(user.getId(), title)) {
            throw new BadRequestException("Le titre doit être unique pour chaque utilisateur");
        }
    }

    private Category resolveCategoryForUser(Long id, Long userId) {
        return resolveCategoryForUser(id, userId, Status.ACTIVE);
    }

    private Category resolveCategoryForUser(Long id, Long userId, Status status) {
        return Objects.requireNonNull(
            categoryRepository.findByIdAndUserIdAndStatus(id, userId, status)
            .orElseThrow(() -> new ResourceNotFoundException("Catégorie introuvable"))
        );
    }

    private void validateCategoryIsNotUsed(Long categoryId, Long userId) {
        boolean goal = goalRepository.existsByCategoryIdAndUserId(categoryId, userId);
        boolean task = taskRepository.existsByCategoryIdAndUserId(categoryId, userId);

        if(goal || task) {
            throw new BadRequestException("La catégorie est utilisée par une tâche ou un objectif et ne peut pas être supprimée", "CATEGORY_USED");
        }
    }

    public Category createCategory(User user, String title) {
        validateUser(user);

        String normalizedTitle = normalizeTitle(title);

        validateTitleUniquenessForUser(normalizedTitle, user);

        Category category = new Category();
        category.setUser(user);
        category.setTitle(normalizedTitle);

        return categoryRepository.save(category);
    }

    public Category updateCategory(Long id, User user, String title) {
        validateUser(user);
        validateCategoryId(id);

        Category existing = resolveCategoryForUser(id, user.getId());

        String normalizedTitle = normalizeTitle(title);

        if(!existing.getTitle().equals(normalizedTitle)) {
            validateTitleUniquenessForUser(normalizedTitle, user);
        }

        existing.setTitle(normalizedTitle);

        return categoryRepository.save(existing);
    }

    public void deleteCategory(Long id, User user) {
        validateUser(user);
        validateCategoryId(id);

        Category existing = resolveCategoryForUser(id, user.getId());

        validateCategoryIsNotUsed(id, user.getId());

        categoryRepository.delete(existing);
    }

    public Category archiveCategory(User user, Long id) {
        validateUser(user);
        validateCategoryId(id);

        Category existing = resolveCategoryForUser(id, user.getId());

        boolean hasActiveGoals = goalRepository.existsByCategoryIdAndUserIdAndStatus(id, user.getId(), Status.ACTIVE);
        boolean hasActiveTasks = taskRepository.existsByCategoryIdAndUserIdAndStatus(id, user.getId(), Status.ACTIVE);

        if(hasActiveGoals || hasActiveTasks) {
            throw new BadRequestException("La catégorie contient des objectifs actifs ou des tâches actives", "CATEGORY_HAS_ACTIVE_CHILDREN");
        }

        existing.setStatus(Status.ARCHIVED);

        return categoryRepository.save(existing);
    }

    public Category restoreCategory(User user, Long id) {
        validateUser(user);
        validateCategoryId(id);

        Category existing = resolveCategoryForUser(id, user.getId(), Status.ARCHIVED);

        existing.setStatus(Status.ACTIVE);

        return categoryRepository.save(existing);
    }

    @Transactional(readOnly = true)
    public List<Category> getCategoriesForUser(User user) {
        validateUser(user);

        return categoryRepository.findByUserId(user.getId());
    }

    @Transactional(readOnly = true)
    public List<Category> getCategoriesByStatusForUser(User user, Status status) {
        validateUser(user);

        return categoryRepository.findByUserIdAndStatusOrderByTitleAsc(user.getId(), status);
    }

    @Transactional(readOnly = true)
    public Category getCategoryByIdForUser(User user, Long id) {
        validateUser(user);
        validateCategoryId(id);

        return resolveCategoryForUser(id, user.getId());
    }
}
