package com.charbel.lifeos.mapper;

import org.springframework.stereotype.Component;

import com.charbel.lifeos.dto.GoalResponse;
import com.charbel.lifeos.entity.Goal;

@Component
public class GoalMapper {
    public GoalResponse toResponse(Goal goal) {
        GoalResponse response = new GoalResponse();
        response.setId(goal.getId());
        response.setTitle(goal.getTitle());
        response.setCategoryId(goal.getCategory().getId());
        response.setStatus(goal.getStatus());
        return response;
    }
}
