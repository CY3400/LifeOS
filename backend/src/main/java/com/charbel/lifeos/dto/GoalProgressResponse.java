package com.charbel.lifeos.dto;

public class GoalProgressResponse {
    private Long goalId;
    private Long totalPlannings;
    private Long completedPlannings;
    private Long remainingPlannings;
    private Double progressRate;

    public Long getGoalId(){
        return goalId;
    }

    public void setGoalId(Long goalId) {
        this.goalId = goalId;
    }

    public Long getTotalPlannings(){
        return totalPlannings;
    }

    public void setTotalPlannings(Long totalPlannings) {
        this.totalPlannings = totalPlannings;
    }

    public Long getCompletedPlannings(){
        return completedPlannings;
    }

    public void setCompletedPlannings(Long completedPlannings) {
        this.completedPlannings = completedPlannings;
    }

    public Long getRemainingPlannings(){
        return remainingPlannings;
    }

    public void setRemainingPlannings(Long remainingPlannings) {
        this.remainingPlannings = remainingPlannings;
    }

    public Double getProgressRate(){
        return progressRate;
    }

    public void setProgressRate(Double progressRate) {
        this.progressRate = progressRate;
    }
}
