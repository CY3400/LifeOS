package com.charbel.lifeos.dto;

public interface GoalProgressProjection {
    Long getGoalId();
    Long getTotalPlannings();
    Long getCompletedPlannings();
    Long getRemainingPlannings();
    Double getProgressRate();
}