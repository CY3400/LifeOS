package com.charbel.lifeos.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.charbel.lifeos.dto.CompleteTaskScheduleRequest;
import com.charbel.lifeos.dto.CreateTaskScheduleRequest;
import com.charbel.lifeos.dto.RepeatTaskScheduleRequest;
import com.charbel.lifeos.dto.TaskScheduleResponse;
import com.charbel.lifeos.dto.UpdateTaskScheduleRequest;
import com.charbel.lifeos.entity.TaskSchedule;
import com.charbel.lifeos.entity.User;
import com.charbel.lifeos.mapper.TaskScheduleMapper;
import com.charbel.lifeos.service.CurrentUserService;
import com.charbel.lifeos.service.TaskScheduleService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/task-schedules")
public class TaskScheduleController {
    private final TaskScheduleService taskScheduleService;
    private final CurrentUserService currentUserService;
    private final TaskScheduleMapper taskScheduleMapper;

    public TaskScheduleController(TaskScheduleService taskScheduleService, CurrentUserService currentUserService, TaskScheduleMapper taskScheduleMapper) {
        this.taskScheduleService = taskScheduleService;
        this.currentUserService = currentUserService;
        this.taskScheduleMapper = taskScheduleMapper;
    }

    @PostMapping
    public ResponseEntity<TaskScheduleResponse> create(@Valid @RequestBody CreateTaskScheduleRequest req, Authentication auth) {
        User user = currentUserService.getCurrentUser(auth);

        TaskSchedule created = taskScheduleService.createTaskSchedule(user, req.getTaskId(), req.getTaskDate(), req.getStartTime(), req.getEndTime(), req.getPriority());

        return ResponseEntity.status(201).body(taskScheduleMapper.toResponse(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskScheduleResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateTaskScheduleRequest req, Authentication auth) {
        User user = currentUserService.getCurrentUser(auth);

        TaskSchedule updated = taskScheduleService.updateTaskSchedule(id, user, req.getTaskId(), req.getTaskDate(), req.getStartTime(), req.getEndTime(), req.getPriority());

        return ResponseEntity.ok(taskScheduleMapper.toResponse(updated));
    }

    @PutMapping("/{id}/following")
    public ResponseEntity<Void> updateFollowing(@PathVariable Long id, @Valid @RequestBody UpdateTaskScheduleRequest req, Authentication auth) {
        User user = currentUserService.getCurrentUser(auth);

        taskScheduleService.updateTaskScheduleAndFollowing(id, user, req.getTaskId(), req.getTaskDate(), req.getStartTime(), req.getEndTime(), req.getPriority());

        return ResponseEntity.noContent().build();
    }


    @PutMapping("/{id}/complete")
    public ResponseEntity<TaskScheduleResponse> complete(@PathVariable Long id, @Valid @RequestBody CompleteTaskScheduleRequest req, Authentication auth) {
        User user = currentUserService.getCurrentUser(auth);

        TaskSchedule updated = taskScheduleService.completeTaskSchedule(id, user, req.getCompleted());

        return ResponseEntity.ok(taskScheduleMapper.toResponse(updated));
    }

    @GetMapping
    public ResponseEntity<List<TaskScheduleResponse>> getAll(Authentication auth) {
        User user = currentUserService.getCurrentUser(auth);

        List<TaskScheduleResponse> schedules = taskScheduleService.getTaskSchedulesForUser(user).stream().map(taskScheduleMapper::toResponse).toList();

        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskScheduleResponse> getById(@PathVariable Long id, Authentication auth) {
        User user = currentUserService.getCurrentUser(auth);

        TaskSchedule schedule = taskScheduleService.getTaskScheduleByIdForUser(user, id);

        return ResponseEntity.ok(taskScheduleMapper.toResponse(schedule));
    }

    @GetMapping("/date/{taskDate}")
    public ResponseEntity<List<TaskScheduleResponse>> getByDate(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate taskDate, Authentication auth) {
        User user = currentUserService.getCurrentUser(auth);

        List<TaskScheduleResponse> schedules = taskScheduleService.getTaskSchedulesByDateForUser(user, taskDate).stream().map(taskScheduleMapper::toResponse).toList();

        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/date/between")
    public ResponseEntity<List<TaskScheduleResponse>> getBetweenDates(@RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate, @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate, Authentication auth) {
        User user = currentUserService.getCurrentUser(auth);

        List<TaskScheduleResponse> schedules = taskScheduleService.getTaskSchedulesBetweenDates(user, startDate, endDate).stream().map(taskScheduleMapper::toResponse).toList();

        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<TaskScheduleResponse>> getByTask(@PathVariable Long taskId, Authentication auth) {
        User user = currentUserService.getCurrentUser(auth);

        List<TaskScheduleResponse> schedules = taskScheduleService.getTaskSchedulesByTaskIdForUser(user, taskId).stream().map(taskScheduleMapper::toResponse).toList();

        return ResponseEntity.ok(schedules);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        User user = currentUserService.getCurrentUser(auth);

        taskScheduleService.deleteTaskSchedule(id, user);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/following")
    public ResponseEntity<Void> deleteFollowing(@PathVariable Long id, Authentication auth) {
        User user = currentUserService.getCurrentUser(auth);

        taskScheduleService.deleteTaskScheduleAndFollowing(id, user);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/repeat")
    public ResponseEntity<List<TaskScheduleResponse>> createRepeated(@Valid @RequestBody RepeatTaskScheduleRequest req, Authentication auth) {
        User user = currentUserService.getCurrentUser(auth);

        List<TaskSchedule> createdSchedules = taskScheduleService.createRepeatedTaskSchedules(user, req.getTaskId(), req.getStartDate(), req.getEndDate(), req.getStartTime(), req.getEndTime(), req.getDaysChosen(), req.getPriority());

        List<TaskScheduleResponse> responses = createdSchedules.stream().map(taskScheduleMapper::toResponse).toList();

        return ResponseEntity.status(201).body(responses);
    }
}