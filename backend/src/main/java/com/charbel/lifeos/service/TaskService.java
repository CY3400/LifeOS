package com.charbel.lifeos.service;

import com.charbel.lifeos.repository.CategoryRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.charbel.lifeos.entity.Task;
import com.charbel.lifeos.entity.Category;
import com.charbel.lifeos.entity.Goal;
import com.charbel.lifeos.entity.Status;
import com.charbel.lifeos.entity.User;
import com.charbel.lifeos.exception.BadRequestException;
import com.charbel.lifeos.exception.ResourceNotFoundException;
import com.charbel.lifeos.repository.TaskRepository;
import com.charbel.lifeos.repository.TaskScheduleRepository;
import com.charbel.lifeos.repository.GoalRepository;

@Service
@Transactional
public class TaskService {
    private final CategoryRepository categoryRepository;
    private final TaskRepository taskRepository;
    private final GoalRepository goalRepository;
    private final TaskScheduleRepository taskScheduleRepository;

    public TaskService(TaskRepository taskRepository, GoalRepository goalRepository, CategoryRepository categoryRepository, TaskScheduleRepository taskScheduleRepository) {
        this.taskRepository = taskRepository;
        this.goalRepository = goalRepository;
        this.categoryRepository = categoryRepository;
        this.taskScheduleRepository = taskScheduleRepository;
    }

    private void validateUser(User user) {
        if(user == null) {
            throw new BadRequestException("Utilisateur requis");
        }
    }

    private void validateTaskId(Long id) {
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

    private Goal resolveGoalForUser(Long goalId, User user) {
        if(goalId != null) {
            return goalRepository.findByIdAndUserIdAndStatus(goalId, user.getId(), Status.ACTIVE).orElseThrow(() -> new ResourceNotFoundException("Objectif introuvable"));
        }
        else {
            return null;
        }
    }

    private Category resolveCategoryForUser(Long categoryId, User user) {
        if(categoryId != null) {
            return categoryRepository.findByIdAndUserIdAndStatus(categoryId, user.getId(), Status.ACTIVE).orElseThrow(() -> new ResourceNotFoundException("Catégorie introuvable"));
        }
        else {
            return null;
        }
    }

    private void validateGoalCategoryChoice(Goal goal, Category category) {
        if(category == null && goal == null) {
            throw new BadRequestException("Une tâche doit être liée soit à une catégorie, soit à un objectif");
        }
        else if(category != null && goal != null) {
            throw new BadRequestException("Une tâche ne peut pas être liée à la fois à une catégorie et à un objectif");
        }
    }

    private Task resolveTaskForUser(Long id, Long userId) {
        return resolveTaskForUser(id, userId, Status.ACTIVE);
    }

    private Task resolveTaskForUser(Long id, Long userId, Status status) {
        return Objects.requireNonNull(taskRepository.findByIdAndUserIdAndStatus(id, userId, status).orElseThrow(() -> new ResourceNotFoundException("Tâche introuvable")));
    }

    private void validateTaskIsNotUsed(Long taskId, Long userId) {
        boolean schedule = taskScheduleRepository.existsByTaskIdAndTaskUserId(taskId, userId);

        if(schedule) {
            throw new BadRequestException("La tâche est utilisée par un ou plusieurs plannings et ne peut pas être supprimée", "TASK_USED");
        }
    }

    public Task createTask(User user, String title, Long goalId, Long categoryId, String description) {
        validateUser(user);

        String normalizedTitle = normalizeTitle(title);

        Goal goal = resolveGoalForUser(goalId, user);
        Category category = resolveCategoryForUser(categoryId, user);

        validateGoalCategoryChoice(goal, category);

        Task task = new Task();
        task.setUser(user);
        task.setTitle(normalizedTitle);
        task.setDescription(description);
        task.setGoal(goal);
        task.setCategory(category);

        return taskRepository.save(task);
    }

    public Task updateTask(Long id, User user, String title, Long goalId, Long categoryId, String description) {
        validateUser(user);

        validateTaskId(id);

        String normalizedTitle =  normalizeTitle(title);

        Task existing = resolveTaskForUser(id, user.getId());

        Goal goal = resolveGoalForUser(goalId, user);
        Category category = resolveCategoryForUser(categoryId, user);

        validateGoalCategoryChoice(goal, category);

        existing.setTitle(normalizedTitle);
        existing.setDescription(description);
        existing.setGoal(goal);
        existing.setCategory(category);

        return taskRepository.save(existing);
    }

    public void deleteTask(Long id, User user) {
        validateUser(user);

        validateTaskId(id);

        Task existing = resolveTaskForUser(id, user.getId());

        validateTaskIsNotUsed(id, user.getId());

        taskRepository.delete(existing);
    }

    public Task archiveTask(User user, Long id) {
        validateUser(user);

        validateTaskId(id);

        Task existing = resolveTaskForUser(id, user.getId());

        LocalDate today = LocalDate.now();

        boolean hasFutureUncompletedSchedules = taskScheduleRepository.existsByTaskIdAndTaskUserIdAndCompletedFalseAndTaskDateGreaterThanEqual(id, user.getId(), today);

        if(hasFutureUncompletedSchedules) {
            throw new BadRequestException("Une tâche ne peut pas être archivée s'il reste des plannings non complétés", "TASK_HAS_FUTURE_UNCOMPLETED_SCHEDULES");
        }

        existing.setStatus(Status.ARCHIVED);

        return taskRepository.save(existing);
    }

    public Task restoreTask(User user, Long id) {
        validateUser(user);
        validateTaskId(id);

        Task existing = resolveTaskForUser(id, user.getId(), Status.ARCHIVED);

        boolean hasArchivedGoal = existing.getGoal() != null && existing.getGoal().getStatus() == Status.ARCHIVED;
        boolean hasArchivedCategory = existing.getCategory() != null && existing.getCategory().getStatus() == Status.ARCHIVED;

        if(hasArchivedCategory) {
            throw new BadRequestException("La tâche contient une catégorie archivée", "TASK_HAS_ARCHIVED_CATEGORY");
        }
        else if(hasArchivedGoal) {
            throw new BadRequestException("La tâche contient un objectif archivé", "TASK_HAS_ARCHIVED_GOAL");
        }

        existing.setStatus(Status.ACTIVE);

        return taskRepository.save(existing);
    }

    @Transactional(readOnly = true)
    public List<Task> getTasksForUser(User user) {
        validateUser(user);

        return taskRepository.findByUserId(user.getId());
    }

    @Transactional(readOnly = true)
    public List<Task> getTasksByStatusForUser(User user, Status status) {
        validateUser(user);

        return taskRepository.findByUserIdAndStatus(user.getId(), status);
    }

    @Transactional(readOnly = true)
    public List<Task> getTasksForGoal(User user, Long goalId , Status status) {
        validateUser(user);

        resolveGoalForUser(goalId, user);

        return taskRepository.findByUserIdAndGoalIdAndStatus(user.getId(), goalId, status);
    }

    @Transactional(readOnly = true)
    public Task getTaskByIdForUser(User user, Long id) {
        validateUser(user);

        validateTaskId(id);

        return resolveTaskForUser(id, user.getId());
    }
}
