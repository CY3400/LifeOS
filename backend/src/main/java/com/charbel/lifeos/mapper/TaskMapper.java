package com.charbel.lifeos.mapper;

import org.springframework.stereotype.Component;

import com.charbel.lifeos.dto.TaskResponse;
import com.charbel.lifeos.entity.Task;

@Component
public class TaskMapper {
    public TaskResponse toResponse(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setGoalId(task.getGoal() != null ? task.getGoal().getId() : null);
        response.setCategoryId(task.getCategory() != null ? task.getCategory().getId() : null);
        response.setStatus(task.getStatus());

        return response;
    }
}
