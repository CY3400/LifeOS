package com.charbel.lifeos.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateDailyTaskRequest {
    @NotBlank(message="Le titre est obligatoire")
    @Size(max = 200, message="Le titre doit être au maximum de 200 caractères")
    private String title;

    @NotNull(message="La date est obligatoire")
    private LocalDate taskDate;

    private LocalTime startTime;

    private LocalTime endTime;

    private Long goalId;

    public String getTitle(){
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
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

    @AssertTrue(message = "L'heure de fin ne peut pas être renseignée sans heure de début")
    public boolean isEndTimeValidWithoutStartTime() {
        return endTime == null || startTime != null;
    }

    @AssertTrue(message = "L'heure de fin doit être après l'heure de début")
    public boolean isTimeRangeValid() {
        if (startTime == null || endTime == null) {
            return true;
        }
        return endTime.isAfter(startTime);
    }
}
