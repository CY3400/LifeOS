package com.charbel.lifeos.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.charbel.lifeos.dto.CreateGoalRequest;
import com.charbel.lifeos.dto.GoalResponse;
import com.charbel.lifeos.dto.UpdateGoalRequest;
import com.charbel.lifeos.entity.Goal;
import com.charbel.lifeos.entity.Status;
import com.charbel.lifeos.entity.User;
import com.charbel.lifeos.mapper.GoalMapper;
import com.charbel.lifeos.service.CurrentUserService;
import com.charbel.lifeos.service.GoalService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/goals")
public class GoalController {
    private final GoalService goalService;
    private final CurrentUserService currentUserService;
    private final GoalMapper goalMapper;

    public GoalController(GoalService goalService, CurrentUserService currentUserService, GoalMapper goalMapper) {
        this.goalService = goalService;
        this.currentUserService = currentUserService;
        this.goalMapper = goalMapper;
    }

    @PostMapping
    public ResponseEntity<GoalResponse> create(@Valid @RequestBody CreateGoalRequest req, Authentication auth) {
        User user = currentUserService.getCurrentUser(auth);
        
        Goal created = goalService.createGoal(user, req.getTitle(), req.getCategoryId());

        return ResponseEntity.status(201).body(goalMapper.toResponse(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GoalResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateGoalRequest req, Authentication auth) {
        User user = currentUserService.getCurrentUser(auth);
        
        Goal updated = goalService.updateGoal(id, user, req.getTitle(), req.getCategoryId());

        return ResponseEntity.ok(goalMapper.toResponse(updated));
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<GoalResponse> restore(@PathVariable Long id, Authentication auth) {
        User user = currentUserService.getCurrentUser(auth);
        
        Goal updated = goalService.restoreGoal(user, id);

        return ResponseEntity.ok(goalMapper.toResponse(updated));
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<GoalResponse> archive(@PathVariable Long id, Authentication auth) {
        User user = currentUserService.getCurrentUser(auth);
        
        Goal updated = goalService.archiveGoal(user, id);

        return ResponseEntity.ok(goalMapper.toResponse(updated));
    }

    @GetMapping
    public ResponseEntity<List<GoalResponse>> getGoals(Authentication auth, @RequestParam(required = false) Status status) {
        User user = currentUserService.getCurrentUser(auth);

        if (status == null) {
            status = Status.ACTIVE;
        }

        List<GoalResponse> goals = goalService.getGoalsByStatusForUser(user, status).stream().map(goalMapper::toResponse).toList();

        return ResponseEntity.ok(goals);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GoalResponse> getGoalById(@PathVariable Long id, Authentication auth) {
        User user = currentUserService.getCurrentUser(auth);

        Goal goal = goalService.getGoalByIdForUser(user, id);

        return ResponseEntity.ok(goalMapper.toResponse(goal));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        User user = currentUserService.getCurrentUser(auth);

        goalService.deleteGoal(id, user);

        return ResponseEntity.noContent().build();
    }
}
