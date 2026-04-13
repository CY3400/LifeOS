package com.charbel.lifeos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateTaskRequest {
    @NotBlank(message="Le titre est obligatoire")
    @Size(max = 200, message="Le titre doit être au maximum de 200 caractères")
    private String title;

    private Long goalId;

    public String getTitle(){
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Long getGoalId(){
        return goalId;
    }
    public void setGoalId(Long goalId){
        this.goalId = goalId;
    }
}
