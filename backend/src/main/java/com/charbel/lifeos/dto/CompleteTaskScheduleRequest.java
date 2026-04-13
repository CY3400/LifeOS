package com.charbel.lifeos.dto;

import jakarta.validation.constraints.NotNull;

public class CompleteTaskScheduleRequest {
    @NotNull(message = "Le statut de complétion est requis")
    private Boolean completed;

    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }
}