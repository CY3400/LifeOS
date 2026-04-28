package com.charbel.lifeos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateGoalRequest {
    @NotBlank(message="Le titre est obligatoire")
    @Size(max = 200, message="Le titre doit être au maximum de 200 caractères")
    private String title;

    @NotNull(message = "La catégorie est obligatoire")
    private Long categoryId;

    public String getTitle(){
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Long getCategoryId(){
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }
}
