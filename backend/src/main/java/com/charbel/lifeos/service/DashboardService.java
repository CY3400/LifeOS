package com.charbel.lifeos.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.charbel.lifeos.dto.DashboardResponse;
import com.charbel.lifeos.dto.GoalResponse;
import com.charbel.lifeos.dto.TaskResponse;
import com.charbel.lifeos.entity.Goal;
import com.charbel.lifeos.entity.Task;
import com.charbel.lifeos.entity.TaskSchedule;
import com.charbel.lifeos.entity.User;

@Service
@Transactional
public class DashboardService {
    private final GoalService goalService;
    private final TaskService taskService;
    private final TaskScheduleService taskScheduleService;

    public DashboardService(GoalService goalService, TaskService taskService, TaskScheduleService taskScheduleService) {
        this.goalService = goalService;
        this.taskService = taskService;
        this.taskScheduleService = taskScheduleService;
    }

    private GoalResponse toGoalResponse(Goal goal) {
        GoalResponse response = new GoalResponse();
        response.setId(goal.getId());
        response.setTitle(goal.getTitle());
        return response;
    }

    private TaskResponse toTaskResponse(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setTitle(task.getTitle());
        response.setGoalId(task.getGoal() != null ? task.getGoal().getId() : null);
        return response;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboardForUser(User user) {
        if (user == null) {
            throw new IllegalArgumentException("Utilisateur requis");
        }

        LocalDate today = LocalDate.now();

        List<Goal> goals = goalService.getGoalsForUser(user);
        List<Task> tasks = taskService.getTasksForUser(user);
        List<TaskSchedule> todaySchedules = taskScheduleService.getTaskSchedulesByTaskDateForUser(user, today);

        int totalTasks = todaySchedules.size();
        int completedTasks = (int) todaySchedules.stream().filter(TaskSchedule::isCompleted).count();

        double completionRate = totalTasks > 0 ? (completedTasks * 100.0) / totalTasks : 0.0;

        DashboardResponse dr = new DashboardResponse();
        dr.setGoals(goals.stream().map(this::toGoalResponse).toList());
        dr.setTasks(tasks.stream().map(this::toTaskResponse).toList());
        dr.setTotalTasks(totalTasks);
        dr.setCompletedTasks(completedTasks);
        dr.setCompletionRate(completionRate);

        return dr;
    }
}