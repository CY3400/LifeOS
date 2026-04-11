package com.charbel.lifeos.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.charbel.lifeos.dto.CompleteTaskScheduleRequest;
import com.charbel.lifeos.dto.CreateTaskScheduleRequest;
import com.charbel.lifeos.dto.RepeatTaskScheduleRequest;
import com.charbel.lifeos.dto.TaskScheduleResponse;
import com.charbel.lifeos.dto.UpdateTaskScheduleRequest;
import com.charbel.lifeos.entity.TaskSchedule;
import com.charbel.lifeos.entity.User;
import com.charbel.lifeos.entity.UserPrincipal;
import com.charbel.lifeos.service.TaskScheduleService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/task-schedules")
public class TaskScheduleController {
    private final TaskScheduleService taskScheduleService;

    public TaskScheduleController(TaskScheduleService taskScheduleService) {
        this.taskScheduleService = taskScheduleService;
    }

    private User getUserByAuthentication(Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        return principal.getUser();
    }

    private TaskScheduleResponse toResponse(TaskSchedule schedule) {
        TaskScheduleResponse response = new TaskScheduleResponse();
        response.setId(schedule.getId());
        response.setTaskId(schedule.getTask().getId());
        response.setTaskDate(schedule.getTaskDate());
        response.setStartTime(schedule.getStartTime());
        response.setEndTime(schedule.getEndTime());
        response.setCompleted(schedule.isCompleted());
        response.setSeriesId(schedule.getSeriesId());
        return response;
    }

    @PostMapping
    public ResponseEntity<TaskScheduleResponse> create(@Valid @RequestBody CreateTaskScheduleRequest req, Authentication auth) {
        User user = getUserByAuthentication(auth);

        TaskSchedule created = taskScheduleService.createTaskSchedule(user, req.getTaskId(), req.getTaskDate(), req.getStartTime(), req.getEndTime());

        return ResponseEntity.status(201).body(toResponse(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskScheduleResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateTaskScheduleRequest req, Authentication auth) {
        User user = getUserByAuthentication(auth);

        TaskSchedule updated = taskScheduleService.updateTaskSchedule(id, user, req.getTaskId(), req.getTaskDate(), req.getStartTime(), req.getEndTime());

        return ResponseEntity.ok(toResponse(updated));
    }

    @PutMapping("/{id}/following")
    public ResponseEntity<Void> updateFollowing(@PathVariable Long id, @Valid @RequestBody UpdateTaskScheduleRequest req, Authentication auth) {
        User user = getUserByAuthentication(auth);

        taskScheduleService.updateTaskScheduleAndTheFollowing(id, user, req.getTaskId(), req.getTaskDate(), req.getStartTime(), req.getEndTime());

        return ResponseEntity.noContent().build();
    }


    @PutMapping("/{id}/complete")
    public ResponseEntity<TaskScheduleResponse> complete(@PathVariable Long id, @RequestBody CompleteTaskScheduleRequest req, Authentication auth) {
        User user = getUserByAuthentication(auth);

        TaskSchedule updated = taskScheduleService.completeTaskSchedule(id, user, req.getCompleted());

        return ResponseEntity.ok(toResponse(updated));
    }

    @GetMapping
    public ResponseEntity<List<TaskScheduleResponse>> getAll(Authentication auth) {
        User user = getUserByAuthentication(auth);

        List<TaskScheduleResponse> schedules = taskScheduleService.getTaskSchedulesForUser(user).stream().map(this::toResponse).toList();

        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskScheduleResponse> getById(@PathVariable Long id, Authentication auth) {
        User user = getUserByAuthentication(auth);

        TaskSchedule schedule = taskScheduleService.getTaskScheduleByIdForUser(user, id);

        return ResponseEntity.ok(toResponse(schedule));
    }

    @GetMapping("/date/{taskDate}")
    public ResponseEntity<List<TaskScheduleResponse>> getByDate(@PathVariable LocalDate taskDate, Authentication auth) {
        User user = getUserByAuthentication(auth);

        List<TaskScheduleResponse> schedules = taskScheduleService.getTaskSchedulesByTaskDateForUser(user, taskDate).stream().map(this::toResponse).toList();

        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<TaskScheduleResponse>> getByTask(@PathVariable Long taskId, Authentication auth) {
        User user = getUserByAuthentication(auth);

        List<TaskScheduleResponse> schedules = taskScheduleService.getTaskSchedulesForTask(user, taskId).stream().map(this::toResponse).toList();

        return ResponseEntity.ok(schedules);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        User user = getUserByAuthentication(auth);

        taskScheduleService.deleteTaskSchedule(id, user);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/following")
    public ResponseEntity<Void> deleteFollowing(@PathVariable Long id, Authentication auth) {
        User user = getUserByAuthentication(auth);

        taskScheduleService.deleteTaskScheduleAndTheFollowing(id, user);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/repeat")
    public ResponseEntity<List<TaskScheduleResponse>> createRepeated(@Valid @RequestBody RepeatTaskScheduleRequest req, Authentication auth) {
        User user = getUserByAuthentication(auth);

        List<TaskSchedule> createdSchedules = taskScheduleService.createRepeatTaskSchedule(user, req.getTaskId(), req.getStartDate(), req.getEndDate(), req.getStartTime(), req.getEndTime(), req.getDaysChosen());

        List<TaskScheduleResponse> responses = createdSchedules.stream().map(this::toResponse).toList();

        return ResponseEntity.status(201).body(responses);
    }
}