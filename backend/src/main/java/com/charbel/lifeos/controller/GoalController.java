package com.charbel.lifeos.controller;

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

import com.charbel.lifeos.dto.CreateGoalRequest;
import com.charbel.lifeos.dto.GoalResponse;
import com.charbel.lifeos.dto.UpdateGoalRequest;
import com.charbel.lifeos.entity.Goal;
import com.charbel.lifeos.entity.User;
import com.charbel.lifeos.entity.UserPrincipal;
import com.charbel.lifeos.service.GoalService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/goals")
public class GoalController {
    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    private GoalResponse toResponse(Goal goal) {
        GoalResponse response = new GoalResponse();
        response.setId(goal.getId());
        response.setTitle(goal.getTitle());
        return response;
    }

    private User getUserByAuthentication(Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        return principal.getUser();
    }


    @PostMapping
    public ResponseEntity<GoalResponse> create(@Valid @RequestBody CreateGoalRequest req, Authentication auth) {
        User user = getUserByAuthentication(auth);
        
        Goal created = goalService.createGoal(user, req.getTitle());

        return ResponseEntity.status(201).body(toResponse(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GoalResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateGoalRequest req, Authentication auth) {
        User user = getUserByAuthentication(auth);
        
        Goal updated = goalService.updateGoal(id, user, req.getTitle());

        return ResponseEntity.ok(toResponse(updated));
    }

    @GetMapping
    public ResponseEntity<List<GoalResponse>> getGoals(Authentication auth) {
        User user = getUserByAuthentication(auth);

        List<GoalResponse> goals = goalService.getGoalsForUser(user).stream().map(this::toResponse).toList();

        return ResponseEntity.ok(goals);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GoalResponse> getGoalById(@PathVariable Long id, Authentication auth) {
        User user = getUserByAuthentication(auth);

        Goal goal = goalService.getGoalByIdForUser(user, id);

        return ResponseEntity.ok(toResponse(goal));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        User user = getUserByAuthentication(auth);

        goalService.deleteGoal(id, user);

        return ResponseEntity.noContent().build();
    }
}
