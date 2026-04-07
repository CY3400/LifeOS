package com.charbel.lifeos.dto;

public class TaskResponse {
    private Long id;
    private String title;
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

    public Long getGoalId(){
        return goalId;
    }
    public void setGoalId(Long goalId){
        this.goalId = goalId;
    }
}
