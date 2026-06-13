package com.charbel.lifeos.mapper;

import org.springframework.stereotype.Component;

import com.charbel.lifeos.dto.TaskScheduleResponse;
import com.charbel.lifeos.entity.Category;
import com.charbel.lifeos.entity.Goal;
import com.charbel.lifeos.entity.Task;
import com.charbel.lifeos.entity.TaskSchedule;

@Component
public class TaskScheduleMapper {
    public TaskScheduleResponse toResponse(TaskSchedule schedule) {
        TaskScheduleResponse response = new TaskScheduleResponse();
        Task task = schedule.getTask();
        Category taskCategory = task.getCategory();
        Goal taskGoal = schedule.getTask().getGoal();

        response.setId(schedule.getId());
        response.setTaskId(task.getId());
        response.setTaskTitle(task.getTitle());
        response.setTaskDate(schedule.getTaskDate());
        response.setStartTime(schedule.getStartTime());
        response.setEndTime(schedule.getEndTime());
        response.setCompleted(schedule.isCompleted());
        response.setSeriesId(schedule.getSeriesId());
        response.setPriority(schedule.getPriority());

        if(taskGoal != null) {
            response.setGoalId(taskGoal.getId());
            response.setGoalTitle(taskGoal.getTitle());
        }
      
        if(taskCategory != null) {
            response.setCategoryId(taskCategory.getId());
            response.setCategoryTitle(taskCategory.getTitle());
        }
        else if(taskGoal != null && taskGoal.getCategory() != null) {
            response.setCategoryId(taskGoal.getCategory().getId());
            response.setCategoryTitle(taskGoal.getCategory().getTitle());
        }

        return response;
    }
}
