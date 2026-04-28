package com.charbel.lifeos.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.charbel.lifeos.entity.Priority;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public class RepeatTaskScheduleRequest {
    @NotNull(message = "La tâche est obligatoire")
    private Long taskId;

    @NotNull(message = "La date de début est obligatoire")
    private LocalDate startDate;

    @NotNull(message = "La date de fin est obligatoire")
    private LocalDate endDate;

    @NotEmpty(message = "Les jours de répétition sont obligatoires")
    private List<Integer> daysChosen;

    private LocalTime startTime;
    private LocalTime endTime;

    private Priority priority;

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public List<Integer> getDaysChosen() {
        return daysChosen;
    }

    public void setDaysChosen(List<Integer> daysChosen) {
        this.daysChosen = daysChosen;
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
