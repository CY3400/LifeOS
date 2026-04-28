package com.charbel.lifeos.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.charbel.lifeos.dto.DashboardResponse;
import com.charbel.lifeos.entity.Category;
import com.charbel.lifeos.entity.Goal;
import com.charbel.lifeos.entity.Task;
import com.charbel.lifeos.entity.TaskSchedule;
import com.charbel.lifeos.entity.User;
import com.charbel.lifeos.exception.BadRequestException;
import com.charbel.lifeos.mapper.CategoryMapper;
import com.charbel.lifeos.mapper.GoalMapper;
import com.charbel.lifeos.mapper.TaskMapper;

@Service
@Transactional
public class DashboardService {
    private final GoalService goalService;
    private final TaskService taskService;
    private final CategoryService categoryService;
    private final TaskScheduleService taskScheduleService;
    private final GoalMapper goalMapper;
    private final TaskMapper taskMapper;
    private final CategoryMapper categoryMapper;

    public DashboardService(GoalService goalService, TaskService taskService, CategoryService categoryService, TaskScheduleService taskScheduleService, GoalMapper goalMapper, TaskMapper taskMapper, CategoryMapper categoryMapper) {
        this.goalService = goalService;
        this.taskService = taskService;
        this.categoryService = categoryService;
        this.taskScheduleService = taskScheduleService;
        this.goalMapper = goalMapper;
        this.taskMapper = taskMapper;
        this.categoryMapper = categoryMapper;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboardForUser(User user) {
        if (user == null) {
            throw new BadRequestException("Utilisateur requis");
        }

        LocalDate today = LocalDate.now();

        List<Goal> goals = goalService.getGoalsForUser(user);
        List<Task> tasks = taskService.getTasksForUser(user);
        List<Category> categories = categoryService.getCategoriesForUser(user);
        List<TaskSchedule> todaySchedules = taskScheduleService.getTaskSchedulesByDateForUser(user, today);

        int totalTasks = todaySchedules.size();
        int completedTasks = (int) todaySchedules.stream().filter(TaskSchedule::isCompleted).count();

        double completionRate = totalTasks > 0 ? (completedTasks * 100.0) / totalTasks : 0.0;

        DashboardResponse response = new DashboardResponse();
        response.setGoals(goals.stream().map(goalMapper::toResponse).toList());
        response.setTasks(tasks.stream().map(taskMapper::toResponse).toList());
        response.setCategories(categories.stream().map(categoryMapper::toResponse).toList());
        response.setTotalTasks(totalTasks);
        response.setCompletedTasks(completedTasks);
        response.setCompletionRate(completionRate);

        return response;
    }
}