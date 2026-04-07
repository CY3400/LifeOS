package com.charbel.lifeos.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.charbel.lifeos.entity.Task;
import com.charbel.lifeos.entity.Goal;
import com.charbel.lifeos.entity.User;
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

    private Goal resolveGoalForUser(Long goalId, User user) {
        if(goalId != null) {
            return goalRepository.findByIdAndUserId(goalId, user.getId()).orElseThrow(() -> new ResourceNotFoundException("Objectif introuvable"));
        }
        else {
            return null;
        }
    }

    public Task createTask(User user, String title, Long goalId) {
        if(user == null) {
            throw new IllegalArgumentException("Utilisateur requis");
        }

        if(title == null || title.isBlank()) {
            throw new IllegalArgumentException("Titre requis");
        }

        Goal goal = resolveGoalForUser(goalId, user);

        Task task = new Task();
        task.setUser(user);
        task.setTitle(title);
        task.setGoal(goal);

        return taskRepository.save(task);
    }

    public Task updateTask(Long id, User user, String title, Long goalId) {
        if(user == null) {
            throw new IllegalArgumentException("Utilisateur requis");
        }

        if(title == null || title.isBlank()) {
            throw new IllegalArgumentException("Titre requis");
        }

        if(id == null) {
            throw new IllegalArgumentException("Identifiant requis");
        }

        Task existing = taskRepository.findByIdAndUserId(id, user.getId()).orElseThrow(() -> new ResourceNotFoundException("Tâche introuvable"));

        Goal goal = resolveGoalForUser(goalId, user);

        existing.setTitle(title);
        existing.setGoal(goal);

        return taskRepository.save(existing);
    }

    public void deleteTask(Long id, User user) {
        if(user == null) {
            throw new IllegalArgumentException("Utilisateur requis");
        }

        if(id == null) {
            throw new IllegalArgumentException("Identifiant requis");
        }

        Task existing = taskRepository.findByIdAndUserId(id, user.getId()).orElseThrow(() -> new ResourceNotFoundException("Tâche introuvable"));

        taskRepository.delete(existing);
    }

    @Transactional(readOnly = true)
    public List<Task> getTasksForUser(User user) {
        if(user == null) {
            throw new IllegalArgumentException("Utilisateur requis");
        }

        return taskRepository.findByUserId(user.getId());
    }

    @Transactional(readOnly = true)
    public Task getTaskByIdForUser(User user, Long id) {
        if(user == null) {
            throw new IllegalArgumentException("Utilisateur requis");
        }

        if(id == null) {
            throw new IllegalArgumentException("Identifiant requis");
        }

        return taskRepository.findByIdAndUserId(id, user.getId()).orElseThrow(() -> new ResourceNotFoundException("Tâche introuvable"));
    }
}
