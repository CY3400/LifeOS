package com.charbel.lifeos.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.charbel.lifeos.entity.Priority;

import jakarta.validation.constraints.NotNull;

public class UpdateTaskScheduleRequest {
    @NotNull(message = "La tâche est obligatoire")
    private Long taskId;

    @NotNull(message = "La date est obligatoire")
    private LocalDate taskDate;

    private LocalTime startTime;
    private LocalTime endTime;

    private Priority priority;

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public LocalDate getTaskDate() {
        return taskDate;
    }

    public void setTaskDate(LocalDate taskDate) {
        this.taskDate = taskDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }
}