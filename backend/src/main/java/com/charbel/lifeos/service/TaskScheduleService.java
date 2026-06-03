package com.charbel.lifeos.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.charbel.lifeos.dto.GoalProgressResponse;
import com.charbel.lifeos.entity.Priority;
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

    private Priority resolvePriorityForCreation(Priority priority) {
        return priority == null ? Priority.MEDIUM : priority;
    }

    private Priority resolvePriorityForUpdate(TaskSchedule schedule, Priority priority) {
        return priority == null ? schedule.getPriority() : priority;
    }

    private String getLastSeriesId(Long taskId) {
        return taskScheduleRepository.findTopByTaskIdAndSeriesIdIsNotNullOrderByCreatedAtDesc(taskId).map(TaskSchedule::getSeriesId).orElse(null);
    }

    public TaskSchedule createTaskSchedule(User user, Long taskId, LocalDate taskDate, LocalTime startTime, LocalTime endTime, Priority priority) {
        validateUser(user);

        validateTaskDate(taskDate);

        validateTaskTimes(startTime, endTime);

        Task task = resolveTaskForUser(taskId, user);

        String seriesId = getLastSeriesId(taskId);

        TaskSchedule schedule = new TaskSchedule();
        schedule.setTask(task);
        schedule.setTaskDate(taskDate);
        schedule.setStartTime(startTime);
        schedule.setEndTime(endTime);
        schedule.setPriority(resolvePriorityForCreation(priority));
        schedule.setSeriesId(seriesId);

        return taskScheduleRepository.save(schedule);
    }

    public TaskSchedule updateTaskSchedule(Long id, User user, LocalDate taskDate, LocalTime startTime, LocalTime endTime, Priority priority) {
        validateUser(user);

        validateScheduleId(id);

        validateTaskDate(taskDate);

        validateTaskTimes(startTime, endTime);

        TaskSchedule existing = resolveTaskScheduleForUser(id, user.getId());

        LocalDate today = LocalDate.now();

        if(!existing.getTaskDate().isBefore(today)) {
            existing.setTaskDate(taskDate);
            existing.setStartTime(startTime);
            existing.setEndTime(endTime);
            existing.setPriority(resolvePriorityForUpdate(existing, priority));

            return taskScheduleRepository.save(existing);
        }
        else {
            throw new BadRequestException("Il n'est plus possible de modifier une tâche passée");
        }
    }

    public void updateTaskScheduleAndFollowing(Long id, User user, LocalDate taskDate, LocalTime startTime, LocalTime endTime, Priority priority) {
        validateUser(user);

        validateScheduleId(id);

        validateTaskDate(taskDate);

        validateTaskTimes(startTime, endTime);

        TaskSchedule existing = resolveTaskScheduleForUser(id, user.getId());

        LocalDate today = LocalDate.now();

        if(existing.getSeriesId() == null) {
            updateTaskSchedule(id, user, taskDate, startTime, endTime, priority);
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
            rt.setTaskDate(newDate);
            rt.setStartTime(startTime);
            rt.setEndTime(endTime);
            rt.setPriority(resolvePriorityForUpdate(rt, priority));
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

        return taskScheduleRepository.findByTaskUserIdAndTaskDateOrderByStartTimeAscTaskTitleAsc(user.getId(), taskDate);
    }

    @Transactional(readOnly = true)
    public List<TaskSchedule> getTaskSchedulesBetweenDates(User user, LocalDate startDate, LocalDate endDate) {
        validateUser(user);
        
        if (startDate == null) {
            throw new BadRequestException("Date de début requise");
        }

        if (endDate == null) {
            throw new BadRequestException("Date de fin requise");
        }

        if(endDate.isBefore(startDate)) {
            throw new BadRequestException("La date de fin doit être après ou égale à la date de début");
        }

        return taskScheduleRepository.getTaskSchedulesBetweenDates(user.getId(), startDate, endDate);
    }

    @Transactional(readOnly = true)
    public List<TaskSchedule> getTaskSchedulesByTaskIdForUser(User user, Long taskId) {
        validateUser(user);

        Task task = resolveTaskForUser(taskId, user);

        return taskScheduleRepository.findByTaskId(task.getId());
    }

    public List<TaskSchedule> createRepeatedTaskSchedules(User user, Long taskId, LocalDate startDate, LocalDate endDate, LocalTime startTime, LocalTime endTime, List<Integer> daysChosen, Priority priority) {
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
            if (day == null) {
                throw new BadRequestException("Les jours de répétition ne doivent pas être vides");
            }
            else if (day < 1 || day > 7) {
                throw new BadRequestException("Les jours de répétition doivent être compris entre 1 (lundi) et 7 (dimanche)");
            }
        }

        if(endDate.isBefore(startDate)) {
            throw new BadRequestException("La date de fin doit être après ou égale à la date de début");
        }

        List<TaskSchedule> createdSchedules = new java.util.ArrayList<>();

        String lastSeriesId = getLastSeriesId(taskId);

        String seriesId = lastSeriesId == null ? UUID.randomUUID().toString() : lastSeriesId;

        List<TaskSchedule> isolatedSchedules = taskScheduleRepository.findByTaskIdAndCompletedFalseAndSeriesIdIsNull(taskId);

        for (TaskSchedule t : isolatedSchedules) {
            t.setSeriesId(seriesId);
        }

        taskScheduleRepository.saveAll(isolatedSchedules);

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
                    schedule.setPriority(resolvePriorityForCreation(priority));
                    
                    TaskSchedule saved = taskScheduleRepository.save(schedule);
                    createdSchedules.add(saved);
                }
            }
            currentDate = currentDate.plusDays(1);
        }
        return createdSchedules;
    }

    @Transactional(readOnly = true)
    public List<GoalProgressResponse> getGoalProgress(User user) {
        validateUser(user);

        return taskScheduleRepository.getGoalProgress(user.getId()).stream().map(progress -> {
            GoalProgressResponse response = new GoalProgressResponse();

            response.setGoalId(progress.getGoalId());
            response.setTotalPlannings(progress.getTotalPlannings());
            response.setCompletedPlannings(progress.getCompletedPlannings());
            response.setRemainingPlannings(progress.getRemainingPlannings());
            response.setProgressRate(progress.getProgressRate());

            return response;
        }).toList();
    }
}