package com.charbel.lifeos.controller;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RestController;

import com.charbel.lifeos.dto.CreateDailyTaskRequest;
import com.charbel.lifeos.dto.DailyTaskResponse;
import com.charbel.lifeos.dto.UpdateDailyTaskRequest;
import com.charbel.lifeos.entity.DailyTask;
import com.charbel.lifeos.entity.User;
import com.charbel.lifeos.entity.UserPrincipal;
import com.charbel.lifeos.service.DailyTaskService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tasks")
public class DailyTaskController {
    private final DailyTaskService dailyTaskService;

    public DailyTaskController(DailyTaskService dailyTaskService) {
        this.dailyTaskService = dailyTaskService;
    }

    private DailyTaskResponse toResponse(DailyTask dailyTask) {
        DailyTaskResponse response = new DailyTaskResponse();
        response.setId(dailyTask.getId());
        response.setTitle(dailyTask.getTitle());
        response.setCompleted(dailyTask.isCompleted());
        response.setTaskDate(dailyTask.getTaskDate());
        response.setStartTime(dailyTask.getStartTime());
        response.setEndTime(dailyTask.getEndTime());
        response.setGoalId(dailyTask.getGoal() != null ? dailyTask.getGoal().getId() : null);

        return response;
    }

    private User getUserByAuthentication(Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        return principal.getUser();
    }

    @PostMapping
    public ResponseEntity<DailyTaskResponse> create(@Valid @RequestBody CreateDailyTaskRequest req, Authentication auth) {
        User user = getUserByAuthentication(auth);
        
        DailyTask created = dailyTaskService.createDailyTask(user, req.getTitle(), req.getTaskDate(), req.getStartTime(), req.getEndTime(), req.getGoalId());

        return ResponseEntity.status(201).body(toResponse(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DailyTaskResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateDailyTaskRequest req, Authentication auth) {
        User user = getUserByAuthentication(auth);
        
        DailyTask updated = dailyTaskService.updateDailyTask(id, user, req.getTitle(), req.getTaskDate(), req.getStartTime(), req.getEndTime(), req.getGoalId());

        return ResponseEntity.ok(toResponse(updated));
    }

    @GetMapping
    public ResponseEntity<List<DailyTaskResponse>> getDailyTasks(Authentication auth) {
        User user = getUserByAuthentication(auth);

        List<DailyTaskResponse> dailyTasks = dailyTaskService.getDailyTasksForUser(user).stream().map(this::toResponse).toList();

        return ResponseEntity.ok(dailyTasks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DailyTaskResponse> getDailyTaskById(@PathVariable Long id, Authentication auth) {
        User user = getUserByAuthentication(auth);

        DailyTask dailyTask = dailyTaskService.getDailyTaskByIdForUser(user, id);

        return ResponseEntity.ok(toResponse(dailyTask));
    }

    @GetMapping("/date/{taskDate}")
    public ResponseEntity<List<DailyTaskResponse>> getDailyTasksByTaskDateForUser(@PathVariable LocalDate taskDate, Authentication auth) {
        User user = getUserByAuthentication(auth);

        List<DailyTaskResponse> dailyTasks = dailyTaskService.getDailyTasksByTaskDateForUser(user, taskDate).stream().map(this::toResponse).toList();

        return ResponseEntity.ok(dailyTasks);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        User user = getUserByAuthentication(auth);

        dailyTaskService.deleteDailyTask(id, user);

        return ResponseEntity.noContent().build();
    }
}
