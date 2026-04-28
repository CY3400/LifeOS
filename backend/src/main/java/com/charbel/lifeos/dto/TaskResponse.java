package com.charbel.lifeos.dto;

public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private Long goalId;
    private Long categoryId;

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

    public String getDescription(){
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getGoalId(){
        return goalId;
    }
    public void setGoalId(Long goalId){
        this.goalId = goalId;
    }

    public Long getCategoryId(){
        return categoryId;
    }
    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }
}
