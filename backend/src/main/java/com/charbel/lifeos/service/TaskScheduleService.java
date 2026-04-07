package com.charbel.lifeos.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.charbel.lifeos.entity.Task;
import com.charbel.lifeos.entity.TaskSchedule;
import com.charbel.lifeos.entity.User;
import com.charbel.lifeos.exception.ResourceNotFoundException;
import com.charbel.lifeos.repository.TaskRepository;
import com.charbel.lifeos.repository.TaskScheduleRepository;

@Service
@Transactional
public class TaskScheduleService {
    private final TaskScheduleRepository taskScheduleRepository;
    private final TaskRepository taskRepository;

    public TaskScheduleService(TaskScheduleRepository taskScheduleRepository, TaskRepository taskRepository) {
        this.taskScheduleRepository = taskScheduleRepository;
        this.taskRepository = taskRepository;
    }

    private Task resolveTaskForUser(Long taskId, User user) {
        if (taskId == null) {
            throw new IllegalArgumentException("La tâche est obligatoire");
        }

        if (user == null) {
            throw new IllegalArgumentException("Utilisateur requis");
        }

        return taskRepository.findByIdAndUserId(taskId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Tâche introuvable"));
    }

    private void validateTaskTimes(LocalTime startTime, LocalTime endTime) {
        if (startTime == null && endTime != null) {
            throw new IllegalArgumentException("L'heure de fin ne peut pas être renseignée sans heure de début");
        }

        if (startTime != null && endTime != null && !endTime.isAfter(startTime)) {
            throw new IllegalArgumentException("L'heure de fin doit être après l'heure de début");
        }
    }

    public TaskSchedule createTaskSchedule(User user, Long taskId, LocalDate taskDate, LocalTime startTime, LocalTime endTime) {
        if (user == null) {
            throw new IllegalArgumentException("Utilisateur requis");
        }

        if (taskDate == null) {
            throw new IllegalArgumentException("Date requise");
        }

        validateTaskTimes(startTime, endTime);

        Task task = resolveTaskForUser(taskId, user);

        TaskSchedule schedule = new TaskSchedule();
        schedule.setTask(task);
        schedule.setTaskDate(taskDate);
        schedule.setStartTime(startTime);
        schedule.setEndTime(endTime);

        return taskScheduleRepository.save(schedule);
    }

    public TaskSchedule updateTaskSchedule(Long id, User user, Long taskId, LocalDate taskDate, LocalTime startTime, LocalTime endTime) {
        if (user == null) {
            throw new IllegalArgumentException("Utilisateur requis");
        }

        if (id == null) {
            throw new IllegalArgumentException("Identifiant requis");
        }

        if (taskDate == null) {
            throw new IllegalArgumentException("Date requise");
        }

        validateTaskTimes(startTime, endTime);

        TaskSchedule existing = taskScheduleRepository.findByIdAndTaskUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Planning introuvable"));

        Task task = resolveTaskForUser(taskId, user);

        existing.setTask(task);
        existing.setTaskDate(taskDate);
        existing.setStartTime(startTime);
        existing.setEndTime(endTime);

        return taskScheduleRepository.save(existing);
    }

    public TaskSchedule completeTaskSchedule(Long id, User user, Boolean completed) {
        if (user == null) {
            throw new IllegalArgumentException("Utilisateur requis");
        }

        if (id == null) {
            throw new IllegalArgumentException("Identifiant requis");
        }

        if (completed == null) {
            throw new IllegalArgumentException("Le statut completed est requis");
        }

        TaskSchedule existing = taskScheduleRepository.findByIdAndTaskUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Planning introuvable"));

        existing.setCompleted(completed);

        return taskScheduleRepository.save(existing);
    }

    public void deleteTaskSchedule(Long id, User user) {
        if (user == null) {
            throw new IllegalArgumentException("Utilisateur requis");
        }

        if (id == null) {
            throw new IllegalArgumentException("Identifiant requis");
        }

        TaskSchedule existing = taskScheduleRepository.findByIdAndTaskUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Planning introuvable"));

        taskScheduleRepository.delete(existing);
    }

    @Transactional(readOnly = true)
    public List<TaskSchedule> getTaskSchedulesForUser(User user) {
        if (user == null) {
            throw new IllegalArgumentException("Utilisateur requis");
        }

        return taskScheduleRepository.findByTaskUserId(user.getId());
    }

    @Transactional(readOnly = true)
    public TaskSchedule getTaskScheduleByIdForUser(User user, Long id) {
        if (user == null) {
            throw new IllegalArgumentException("Utilisateur requis");
        }

        if (id == null) {
            throw new IllegalArgumentException("Identifiant requis");
        }

        return taskScheduleRepository.findByIdAndTaskUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Planning introuvable"));
    }

    @Transactional(readOnly = true)
    public List<TaskSchedule> getTaskSchedulesByTaskDateForUser(User user, LocalDate taskDate) {
        if (user == null) {
            throw new IllegalArgumentException("Utilisateur requis");
        }

        if (taskDate == null) {
            throw new IllegalArgumentException("Date requise");
        }

        return taskScheduleRepository.findByTaskUserIdAndTaskDateOrderByStartTime(user.getId(), taskDate);
    }

    @Transactional(readOnly = true)
    public List<TaskSchedule> getTaskSchedulesForTask(User user, Long taskId) {
        if (user == null) {
            throw new IllegalArgumentException("Utilisateur requis");
        }

        Task task = resolveTaskForUser(taskId, user);

        return taskScheduleRepository.findByTaskId(task.getId());
    }
}