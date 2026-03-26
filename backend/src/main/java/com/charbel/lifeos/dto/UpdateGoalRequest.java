package com.charbel.lifeos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateGoalRequest {
    @NotBlank(message="Le titre est obligatoire")
    @Size(max = 200, message="Le titre doit être au maximum de 200 caractères")
    private String title;

    public String getTitle(){
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}
