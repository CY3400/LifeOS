package com.charbel.lifeos.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.charbel.lifeos.dto.DailyTaskResponse;
import com.charbel.lifeos.dto.DashboardResponse;
import com.charbel.lifeos.dto.GoalResponse;
import com.charbel.lifeos.entity.DailyTask;
import com.charbel.lifeos.entity.Goal;
import com.charbel.lifeos.entity.User;

@Service
@Transactional
public class DashboardService {
    private final GoalService goalService;
    private final DailyTaskService dailyTaskService;

    public DashboardService(GoalService goalService, DailyTaskService dailyTaskService) {
        this.dailyTaskService = dailyTaskService;
        this.goalService = goalService;
    }

    private GoalResponse toGoalResponse(Goal goal) {
        GoalResponse response = new GoalResponse();
        response.setId(goal.getId());
        response.setTitle(goal.getTitle());
        return response;
    }

    private DailyTaskResponse toDailyTaskResponse(DailyTask dailyTask) {
        DailyTaskResponse response = new DailyTaskResponse();
        response.setId(dailyTask.getId());
        response.setTitle(dailyTask.getTitle());
        response.setCompleted(dailyTask.isCompleted());
        response.setTaskDate(dailyTask.getTaskDate());
        response.setStartTime(dailyTask.getStartTime());
        response.setEndTime(dailyTask.getEndTime());
        response.setGoalId(dailyTask.getGoal() != null ? dailyTask.getGoal().getId() : null);

        return response;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getTodayDashboardForUser(User user) {
        if(user == null) {
            throw new IllegalArgumentException("Utilisateur requis");
        }

        List<Goal> goals = goalService.getGoalsForUser(user);
        List<DailyTask> dailyTasks = dailyTaskService.getDailyTasksByTaskDateForUser(user, LocalDate.now());
        int totalTasks = dailyTasks.size();
        int completedTasks = 0;
        double completionRate;
        for(DailyTask task: dailyTasks) {
            if(task.isCompleted()) {
                completedTasks ++;
            }
        }

        if(totalTasks == 0) {
            completionRate = 0.0;
        }
        else {
            completionRate = (completedTasks * 100.0)/totalTasks;
        }

        DashboardResponse dr = new DashboardResponse();

        dr.setGoals(goals.stream().map(this::toGoalResponse).toList());
        dr.setDailyTasks(dailyTasks.stream().map(this::toDailyTaskResponse).toList());
        dr.setTotalTasks(totalTasks);
        dr.setCompletedTasks(completedTasks);
        dr.setCompletionRate(completionRate);

        return dr;
    }
}
