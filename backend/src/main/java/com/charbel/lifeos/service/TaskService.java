package com.charbel.lifeos.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.charbel.lifeos.entity.Task;
import com.charbel.lifeos.entity.Goal;
import com.charbel.lifeos.entity.User;
import com.charbel.lifeos.exception.BadRequestException;
import com.charbel.lifeos.exception.ResourceNotFoundException;
import com.charbel.lifeos.repository.TaskRepository;
import com.charbel.lifeos.repository.GoalRepository;

@Service
@Transactional
public class TaskService {
    private final TaskRepository taskRepository;
    private final GoalRepository goalRepository;

    public TaskService(TaskRepository taskRepository, GoalRepository goalRepository) {
        this.taskRepository = taskRepository;
        this.goalRepository = goalRepository;
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

    private void validateTitle(String title) {
        if(title == null || title.isBlank()) {
            throw new BadRequestException("Titre requis");
        }
    }

    private Goal resolveGoalForUser(Long goalId, User user) {
        if(goalId != null) {
            return goalRepository.findByIdAndUserId(goalId, user.getId()).orElseThrow(() -> new ResourceNotFoundException("Objectif introuvable"));
        }
        else {
            return null;
        }
    }

    private Task resolveTaskForUser(Long id, Long userId) {
        return taskRepository.findByIdAndUserId(id, userId).orElseThrow(() -> new ResourceNotFoundException("Tâche introuvable"));
    }

    public Task createTask(User user, String title, Long goalId) {
        validateUser(user);

        validateTitle(title);

        Goal goal = resolveGoalForUser(goalId, user);

        Task task = new Task();
        task.setUser(user);
        task.setTitle(title);
        task.setGoal(goal);

        return taskRepository.save(task);
    }

    public Task updateTask(Long id, User user, String title, Long goalId) {
        validateUser(user);

        validateTitle(title);

        validateTaskId(id);

        Task existing = resolveTaskForUser(id, user.getId());

        Goal goal = resolveGoalForUser(goalId, user);

        existing.setTitle(title);
        existing.setGoal(goal);

        return taskRepository.save(existing);
    }

    public void deleteTask(Long id, User user) {
        validateUser(user);

        validateTaskId(id);

        Task existing = resolveTaskForUser(id, user.getId());

        taskRepository.delete(existing);
    }

    @Transactional(readOnly = true)
    public List<Task> getTasksForUser(User user) {
        validateUser(user);

        return taskRepository.findByUserId(user.getId());
    }

    @Transactional(readOnly = true)
    public Task getTaskByIdForUser(User user, Long id) {
        validateUser(user);

        validateTaskId(id);

        return resolveTaskForUser(id, user.getId());
    }
}
