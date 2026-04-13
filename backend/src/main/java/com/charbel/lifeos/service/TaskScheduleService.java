package com.charbel.lifeos.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.charbel.lifeos.entity.Task;
import com.charbel.lifeos.entity.TaskSchedule;
import com.charbel.lifeos.entity.User;
import com.charbel.lifeos.exception.BadRequestException;
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

    private void validateUser(User user) {
        if(user == null) {
            throw new BadRequestException("Utilisateur requis");
        }
    }

    private void validateScheduleId(Long id) {
        if(id == null) {
            throw new BadRequestException("Identifiant requis");
        }
    }

    private void validateTaskDate(LocalDate taskDate) {
        if (taskDate == null) {
            throw new BadRequestException("Date requise");
        }
    }

    private Task resolveTaskForUser(Long taskId, User user) {
        if (taskId == null) {
            throw new BadRequestException("La tâche est obligatoire");
        }

        validateUser(user);

        return taskRepository.findByIdAndUserId(taskId, user.getId()).orElseThrow(() -> new ResourceNotFoundException("Tâche introuvable"));
    }

    private TaskSchedule resolveTaskScheduleForUser(Long id, Long userId) {
        return taskScheduleRepository.findByIdAndTaskUserId(id, userId).orElseThrow(() -> new ResourceNotFoundException("Planning introuvable"));
    }

    private void validateTaskTimes(LocalTime startTime, LocalTime endTime) {
        if (startTime == null && endTime != null) {
            throw new BadRequestException("L'heure de fin ne peut pas être renseignée sans heure de début");
        }

        if (startTime != null && endTime != null && !endTime.isAfter(startTime)) {
            throw new BadRequestException("L'heure de fin doit être après l'heure de début");
        }
    }

    public TaskSchedule createTaskSchedule(User user, Long taskId, LocalDate taskDate, LocalTime startTime, LocalTime endTime) {
        validateUser(user);

        validateTaskDate(taskDate);

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
        validateUser(user);

        validateScheduleId(id);

        validateTaskDate(taskDate);

        validateTaskTimes(startTime, endTime);

        TaskSchedule existing = resolveTaskScheduleForUser(id, user.getId());

        Task task = resolveTaskForUser(taskId, user);

        LocalDate today = LocalDate.now();

        if(!existing.getTaskDate().isBefore(today)) {
            existing.setTask(task);
            existing.setTaskDate(taskDate);
            existing.setStartTime(startTime);
            existing.setEndTime(endTime);

            return taskScheduleRepository.save(existing);
        }
        else {
            throw new BadRequestException("Il n'est plus possible de modifier une tâche passée");
        }
    }

    public void updateTaskScheduleAndFollowing(Long id, User user, Long taskId, LocalDate taskDate, LocalTime startTime, LocalTime endTime) {
        validateUser(user);

        validateScheduleId(id);

        validateTaskDate(taskDate);

        validateTaskTimes(startTime, endTime);

        TaskSchedule existing = resolveTaskScheduleForUser(id, user.getId());

        Task task = resolveTaskForUser(taskId, user);

        LocalDate today = LocalDate.now();

        if(existing.getSeriesId() == null) {
            updateTaskSchedule(id, user, taskId, taskDate, startTime, endTime);
            return;
        }

        if (existing.getTaskDate().isBefore(today)) {
            throw new BadRequestException("Il n'est plus possible de modifier une ou plusieurs tâches passées");
        }

        List<TaskSchedule> repeatTasks = taskScheduleRepository.findByTaskUserIdAndSeriesIdAndTaskDateGreaterThanEqual(user.getId(), existing.getSeriesId(), existing.getTaskDate());

        long deltaDays = ChronoUnit.DAYS.between(existing.getTaskDate(), taskDate);

        for(TaskSchedule rt : repeatTasks) {
            LocalDate newDate = rt.getTaskDate().plusDays(deltaDays);
            if(newDate.isBefore(today)) {
                throw new BadRequestException("La modification déplacerait une ou plusieurs tâches dans le passé");
            }
            rt.setTask(task);
            rt.setTaskDate(newDate);
            rt.setStartTime(startTime);
            rt.setEndTime(endTime);
        }

        taskScheduleRepository.saveAll(repeatTasks);
    }

    public TaskSchedule completeTaskSchedule(Long id, User user, Boolean completed) {
        validateUser(user);

        validateScheduleId(id);

        if (completed == null) {
            throw new BadRequestException("Le statut completed est requis");
        }

        TaskSchedule existing = resolveTaskScheduleForUser(id, user.getId());

        existing.setCompleted(completed);

        return taskScheduleRepository.save(existing);
    }

    public void deleteTaskSchedule(Long id, User user) {
        validateUser(user);

        validateScheduleId(id);

        TaskSchedule existing = resolveTaskScheduleForUser(id, user.getId());

        LocalDate today = LocalDate.now();

        if(!existing.getTaskDate().isBefore(today)) {
            taskScheduleRepository.delete(existing);
        }
        else {
            throw new BadRequestException("Il n'est plus possible de supprimer une tâche passée");
        }
    }

    public void deleteTaskScheduleAndFollowing(Long id, User user) {
        validateUser(user);

        validateScheduleId(id);

        TaskSchedule existing = resolveTaskScheduleForUser(id, user.getId());
        LocalDate today = LocalDate.now();

        if(existing.getSeriesId() == null) {
            deleteTaskSchedule(id, user);
        }
        else if (!existing.getTaskDate().isBefore(today)) {
            List<TaskSchedule> repeatTasks = taskScheduleRepository.findByTaskUserIdAndSeriesIdAndTaskDateGreaterThanEqual(user.getId(), existing.getSeriesId(), existing.getTaskDate());

            taskScheduleRepository.deleteAll(repeatTasks);
        }
        else {
            throw new BadRequestException("Il n'est plus possible de supprimer une ou plusieurs tâches passées");
        }
    }

    @Transactional(readOnly = true)
    public List<TaskSchedule> getTaskSchedulesForUser(User user) {
        validateUser(user);

        return taskScheduleRepository.findByTaskUserId(user.getId());
    }

    @Transactional(readOnly = true)
    public TaskSchedule getTaskScheduleByIdForUser(User user, Long id) {
        validateUser(user);

        validateScheduleId(id);

        return resolveTaskScheduleForUser(id, user.getId());
    }

    @Transactional(readOnly = true)
    public List<TaskSchedule> getTaskSchedulesByDateForUser(User user, LocalDate taskDate) {
        validateUser(user);

        validateTaskDate(taskDate);

        return taskScheduleRepository.findByTaskUserIdAndTaskDateOrderByStartTime(user.getId(), taskDate);
    }

    @Transactional(readOnly = true)
    public List<TaskSchedule> getTaskSchedulesByTaskIdForUser(User user, Long taskId) {
        validateUser(user);

        Task task = resolveTaskForUser(taskId, user);

        return taskScheduleRepository.findByTaskId(task.getId());
    }

    public List<TaskSchedule> createRepeatedTaskSchedules(User user, Long taskId, LocalDate startDate, LocalDate endDate, LocalTime startTime, LocalTime endTime, List<Integer> daysChosen) {
        validateUser(user);

        if (startDate == null) {
            throw new BadRequestException("Date de début requise");
        }

        if (endDate == null) {
            throw new BadRequestException("Date de fin requise");
        }

        if (daysChosen == null || daysChosen.isEmpty()) {
            throw new BadRequestException("Les jours de répétition sont obligatoires");
        }

        validateTaskTimes(startTime, endTime);

        Task task = resolveTaskForUser(taskId, user);

        for (Integer day : daysChosen) {
            if (day < 1 || day > 7) {
                throw new BadRequestException("Les jours de répétition doivent être compris entre 1 (lundi) et 7 (dimanche)");
            }
        }

        if(endDate.isBefore(startDate)) {
            throw new BadRequestException("La date de fin doit être après ou égale à la date de début");
        }

        List<TaskSchedule> createdSchedules = new java.util.ArrayList<>();

        String seriesId = UUID.randomUUID().toString();

        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            int currentDayOfWeek = currentDate.getDayOfWeek().getValue();
            if (daysChosen.contains(currentDayOfWeek)) {
                boolean exists = taskScheduleRepository.existsByTaskIdAndTaskDateAndStartTimeAndEndTime(task.getId(), currentDate, startTime, endTime);
                
                if(!exists) {
                    TaskSchedule schedule = new TaskSchedule();
                    schedule.setTask(task);
                    schedule.setTaskDate(currentDate);
                    schedule.setStartTime(startTime);
                    schedule.setEndTime(endTime);
                    schedule.setSeriesId(seriesId);
                    
                    TaskSchedule saved = taskScheduleRepository.save(schedule);
                    createdSchedules.add(saved);
                }
            }
            currentDate = currentDate.plusDays(1);
        }
        return createdSchedules;
    }
}