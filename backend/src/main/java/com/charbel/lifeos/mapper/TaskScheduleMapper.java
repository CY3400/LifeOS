package com.charbel.lifeos.mapper;

import org.springframework.stereotype.Component;

import com.charbel.lifeos.dto.TaskScheduleResponse;
import com.charbel.lifeos.entity.TaskSchedule;

@Component
public class TaskScheduleMapper {
    public TaskScheduleResponse toResponse(TaskSchedule schedule) {
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
}
