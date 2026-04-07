package com.charbel.lifeos.controller;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RestController;

import com.charbel.lifeos.dto.CreateTaskRequest;
import com.charbel.lifeos.dto.TaskResponse;
import com.charbel.lifeos.dto.UpdateTaskRequest;
import com.charbel.lifeos.entity.Task;
import com.charbel.lifeos.entity.User;
import com.charbel.lifeos.entity.UserPrincipal;
import com.charbel.lifeos.service.TaskService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    private TaskResponse toResponse(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setTitle(task.getTitle());
        response.setGoalId(task.getGoal() != null ? task.getGoal().getId() : null);

        return response;
    }

    private User getUserByAuthentication(Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        return principal.getUser();
    }

    @PostMapping
    public ResponseEntity<TaskResponse> create(@Valid @RequestBody CreateTaskRequest req, Authentication auth) {
        User user = getUserByAuthentication(auth);
        
        Task created = taskService.createTask(user, req.getTitle(), req.getGoalId());

        return ResponseEntity.status(201).body(toResponse(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateTaskRequest req, Authentication auth) {
        User user = getUserByAuthentication(auth);
        
        Task updated = taskService.updateTask(id, user, req.getTitle(), req.getGoalId());

        return ResponseEntity.ok(toResponse(updated));
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getTasks(Authentication auth) {
        User user = getUserByAuthentication(auth);

        List<TaskResponse> tasks = taskService.getTasksForUser(user).stream().map(this::toResponse).toList();

        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable Long id, Authentication auth) {
        User user = getUserByAuthentication(auth);

        Task task = taskService.getTaskByIdForUser(user, id);

        return ResponseEntity.ok(toResponse(task));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        User user = getUserByAuthentication(auth);

        taskService.deleteTask(id, user);

        return ResponseEntity.noContent().build();
    }
}
