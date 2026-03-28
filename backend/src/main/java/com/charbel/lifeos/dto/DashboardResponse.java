package com.charbel.lifeos.dto;

import java.util.List;

public class DashboardResponse {
    private List<GoalResponse> goals;
    private List<DailyTaskResponse> dailyTasks;
    private int totalTasks;
    private int completedTasks;
    private double completionRate;

    public List<GoalResponse> getGoals(){
        return goals;
    }

    public void setGoals(List<GoalResponse> goals) {
        this.goals = goals;
    }

    public List<DailyTaskResponse> getDailyTasks(){
        return dailyTasks;
    }

    public void setDailyTasks(List<DailyTaskResponse> dailyTasks) {
        this.dailyTasks = dailyTasks;
    }

    public int getTotalTasks(){
        return totalTasks;
    }

    public void setTotalTasks(int totalTasks) {
        this.totalTasks = totalTasks;
    }

    public int getCompletedTasks(){
        return completedTasks;
    }

    public void setCompletedTasks(int completedTasks) {
        this.completedTasks = completedTasks;
    }

    public double getCompletionRate(){
        return completionRate;
    }

    public void setCompletionRate(double completionRate) {
        this.completionRate = completionRate;
    }
}
