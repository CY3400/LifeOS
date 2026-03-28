package com.charbel.lifeos.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.charbel.lifeos.entity.DailyTask;
import com.charbel.lifeos.entity.Goal;
import com.charbel.lifeos.entity.User;
import com.charbel.lifeos.exception.ResourceNotFoundException;
import com.charbel.lifeos.repository.DailyTaskRepository;
import com.charbel.lifeos.repository.GoalRepository;

@Service
@Transactional
public class DailyTaskService {
    private final DailyTaskRepository dailyTaskRepository;
    private final GoalRepository goalRepository;

    public DailyTaskService(DailyTaskRepository dailyTaskRepository, GoalRepository goalRepository) {
        this.dailyTaskRepository = dailyTaskRepository;
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

    public DailyTask createDailyTask(User user, String title, LocalDate taskDate, LocalTime startTime, LocalTime endTime, Long goalId) {
        if(user == null) {
            throw new IllegalArgumentException("Utilisateur requis");
        }

        if(title == null || title.isBlank()) {
            throw new IllegalArgumentException("Titre requis");
        }

        if(taskDate == null) {
            throw new IllegalArgumentException("Date requise");
        }

        Goal goal = resolveGoalForUser(goalId, user);

        DailyTask dt = new DailyTask();
        dt.setUser(user);
        dt.setTitle(title);
        dt.setTaskDate(taskDate);
        dt.setStartTime(startTime);
        dt.setEndTime(endTime);
        dt.setGoal(goal);

        return dailyTaskRepository.save(dt);
    }

    public DailyTask updateDailyTask(Long id, User user, String title, LocalDate taskDate, LocalTime startTime, LocalTime endTime, Long goalId) {
        if(user == null) {
            throw new IllegalArgumentException("Utilisateur requis");
        }

        if(title == null || title.isBlank()) {
            throw new IllegalArgumentException("Titre requis");
        }

        if(taskDate == null) {
            throw new IllegalArgumentException("Date requise");
        }

        if(id == null) {
            throw new IllegalArgumentException("Identifiant requis");
        }

        Goal goal = resolveGoalForUser(goalId, user);

        DailyTask existing = dailyTaskRepository.findByIdAndUserId(id, user.getId()).orElseThrow(() -> new ResourceNotFoundException("Tâche introuvable"));

        existing.setTitle(title);
        existing.setTaskDate(taskDate);
        existing.setStartTime(startTime);
        existing.setEndTime(endTime);
        existing.setGoal(goal);

        return dailyTaskRepository.save(existing);
    }

    public void deleteDailyTask(Long id, User user) {
        if(user == null) {
            throw new IllegalArgumentException("Utilisateur requis");
        }

        if(id == null) {
            throw new IllegalArgumentException("Identifiant requis");
        }

        DailyTask existing = dailyTaskRepository.findByIdAndUserId(id, user.getId()).orElseThrow(() -> new ResourceNotFoundException("Tâche introuvable"));

        dailyTaskRepository.delete(existing);
    }

    @Transactional(readOnly = true)
    public List<DailyTask> getDailyTasksForUser(User user) {
        if(user == null) {
            throw new IllegalArgumentException("Utilisateur requis");
        }

        return dailyTaskRepository.findByUserId(user.getId());
    }

    @Transactional(readOnly = true)
    public DailyTask getDailyTaskByIdForUser(User user, Long id) {
        if(user == null) {
            throw new IllegalArgumentException("Utilisateur requis");
        }

        if(id == null) {
            throw new IllegalArgumentException("Identifiant requis");
        }

        return dailyTaskRepository.findByIdAndUserId(id, user.getId()).orElseThrow(() -> new ResourceNotFoundException("Tâche introuvable"));
    }

    @Transactional(readOnly = true)
    public List<DailyTask> getDailyTasksByTaskDateForUser(User user, LocalDate taskDate) {
        if(user == null) {
            throw new IllegalArgumentException("Utilisateur requis");
        }

        if(taskDate == null) {
            throw new IllegalArgumentException("Date requise");
        }

        return dailyTaskRepository.findByTaskDateAndUserIdOrderByStartTime(taskDate, user.getId());
    }
}
