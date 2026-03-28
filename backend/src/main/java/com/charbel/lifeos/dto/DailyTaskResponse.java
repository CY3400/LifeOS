package com.charbel.lifeos.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class DailyTaskResponse {
    private Long id;
    private String title;
    private boolean completed;
    private LocalDate taskDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Long goalId;

    public Long getId(){
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle(){
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public boolean isCompleted(){
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public LocalDate getTaskDate(){
        return taskDate;
    }

    public void setTaskDate(LocalDate taskDate) {
        this.taskDate = taskDate;
    }

    public LocalTime getStartTime(){
        return startTime;
    }
    public void setStartTime(LocalTime startTime){
        this.startTime = startTime;
    }

    public LocalTime getEndTime(){
        return endTime;
    }
    public void setEndTime(LocalTime endTime){
        this.endTime = endTime;
    }

    public Long getGoalId(){
        return goalId;
    }
    public void setGoalId(Long goalId){
        this.goalId = goalId;
    }
}
