import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type Status = 'ACTIVE' | 'ARCHIVED';

export type LoginRequest = {
  email: string,
  password: string
};

export type RegisterRequest = {
  email: string,
  password: string
};

export type AuthResponse = {
  userId: number,
  email: string,
  role: string,
  message: string
};

export type MeResponse = {
  userId: number,
  email: string,
  role: string
};

export type Goal = {
    id: number,
    title: string,
    categoryId: number,
    status: Status,
    categoryTitle: string
}

export type Task = {
    id: number,
    title: string,
    description: string,
    goalId: number | null,
    categoryId: number | null,
    status: Status
};

export type Category = {
    id: number,
    title: string,
    status: Status
}

export type TaskSchedule = {
    id: number,
    taskId: number,
    taskDate: string,
    startTime: string | null,
    endTime: string | null,
    completed: boolean,
    seriesId: string | null,
    priority: Priority | null
};

export type CreateTaskScheduleRequest = {
  taskId: number,
  taskDate: string,
  startTime: string | null,
  endTime: string | null,
  priority: Priority | null
};

export type UpdateTaskScheduleRequest = {
  taskDate: string,
  startTime: string | null,
  endTime: string | null,
  priority: Priority | null
};

export type Dashboard = {
    goals: Goal[],
    tasks: Task[],
    categories: Category[],
    totalTasks: number,
    completedTasks: number,
    completionRate: number
};

export type GoalProgress = {
    goalId: number,
    totalPlannings: number,
    completedPlannings: number,
    remainingPlannings: number,
    progressRate: number
};

@Injectable({
  providedIn: 'root'
})
export class Api {
    private readonly baseUrl = environment.apiBaseUrl;

    constructor(private http: HttpClient){}

    logout(): Observable<void>{
        return this.http.post<void>(`${this.baseUrl}/auth/logout`, {}, {
            withCredentials: true
        });
    }

    login(user: LoginRequest): Observable<AuthResponse>{
        return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, user, {
            withCredentials: true
        });
    }

    register(user: RegisterRequest): Observable<AuthResponse>{
        return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, user, {
            withCredentials: true
        });
    }

    verify(email: string): Observable<boolean>{
        return this.http.post<boolean>(`${this.baseUrl}/auth/verify`, { email }, {
            withCredentials: true
        });
    }

    me(): Observable<MeResponse> {
        return this.http.get<MeResponse>(`${this.baseUrl}/auth/me`, {
            withCredentials: true
        });
    }

    today(): Observable<Dashboard> {
        return this.http.get<Dashboard>(`${this.baseUrl}/dashboard/today`, {
            withCredentials: true
        });
    }

    createGoal(title: string, categoryId: number): Observable<Goal> {
        return this.http.post<Goal>(`${this.baseUrl}/goals`, { title, categoryId }, {
            withCredentials: true
        });
    }

    updateGoal(id: number, title: string, categoryId: number): Observable<Goal> {
        return this.http.put<Goal>(`${this.baseUrl}/goals/${id}`, { title, categoryId }, {
            withCredentials: true
        });
    }

    deleteGoal(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/goals/${id}`, {
            withCredentials: true
        });
    }

    getGoals(): Observable<Goal[]> {
        return this.http.get<Goal[]>(`${this.baseUrl}/goals`, {
            withCredentials: true
        });
    }

    archiveGoal(id: number): Observable<Goal> {
        return this.http.patch<Goal>(`${this.baseUrl}/goals/${id}/archive`, {}, {
            withCredentials: true
        });
    }

    createTask(title: string, description: string, goalId: number | null, categoryId: number | null): Observable<Task> {
        return this.http.post<Task>(`${this.baseUrl}/tasks`, { title, description, goalId, categoryId }, {
            withCredentials: true
        });
    }

    updateTask(id: number, title: string, description: string, goalId: number | null, categoryId: number | null): Observable<Task> {
        return this.http.put<Task>(`${this.baseUrl}/tasks/${id}`, { title, description, goalId, categoryId }, {
            withCredentials: true
        });
    }

    deleteTask(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/tasks/${id}`, {
            withCredentials: true
        });
    }

    archiveTask(id: number): Observable<Task> {
        return this.http.patch<Task>(`${this.baseUrl}/tasks/${id}/archive`, {}, {
            withCredentials: true
        });
    }

    getGoalTasks(goalId: number): Observable<Task[]> {
        return this.http.get<Task[]>(`${this.baseUrl}/tasks?goalId=${goalId}`, {
            withCredentials: true
        });
    }

    getTaskSchedulesByDate(taskDate: string): Observable<TaskSchedule[]> {
        return this.http.get<TaskSchedule[]>(`${this.baseUrl}/task-schedules/date/${taskDate}`, {
            withCredentials: true
        });
    }

    getTaskSchedulesBetweenDates(startDate: string, endDate: string): Observable<TaskSchedule[]> {
        return this.http.get<TaskSchedule[]>(`${this.baseUrl}/task-schedules/date/between`, {
            params: {
                startDate,
                endDate
            },
            withCredentials: true
        });
    }

    createCategory(title: string): Observable<Category> {
        return this.http.post<Category>(`${this.baseUrl}/categories`, { title }, {
            withCredentials: true
        });
    }

    updateCategory(id: number, title: string): Observable<Category> {
        return this.http.put<Category>(`${this.baseUrl}/categories/${id}`, { title }, {
            withCredentials: true
        });
    }

    deleteCategory(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/categories/${id}`, {
            withCredentials: true
        });
    }

    archiveCategory(id: number): Observable<Category> {
        return this.http.patch<Category>(`${this.baseUrl}/categories/${id}/archive`, {}, {
            withCredentials: true
        });
    }

    createTaskSchedule(payload: CreateTaskScheduleRequest): Observable<TaskSchedule> {
        return this.http.post<TaskSchedule>(`${this.baseUrl}/task-schedules`, payload, {
            withCredentials: true
        });
    }

    updateTaskSchedule(id: number, payload: UpdateTaskScheduleRequest): Observable<TaskSchedule> {
        return this.http.put<TaskSchedule>(`${this.baseUrl}/task-schedules/${id}`, payload, {
            withCredentials: true
        });
    }

    updateFollowing(id: number, payload: UpdateTaskScheduleRequest): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/task-schedules/${id}/following`, payload, {
            withCredentials: true
        });
    }

    completeTaskSchedule(id: number, completed: boolean): Observable<TaskSchedule> {
        return this.http.put<TaskSchedule>(`${this.baseUrl}/task-schedules/${id}/complete`, { completed }, {
            withCredentials: true
        });
    }

    deleteTaskSchedule(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/task-schedules/${id}`, {
            withCredentials: true
        });
    }

    repeatTaskSchedules(taskId: number, startDate: string, endDate: string, startTime: string | null, endTime: string | null, daysChosen: number[], priority: string | null): Observable<TaskSchedule[]> {
        return this.http.post<TaskSchedule[]>(`${this.baseUrl}/task-schedules/repeat`, { taskId, startDate, endDate, startTime, endTime, daysChosen, priority }, {
            withCredentials: true
        });
    }

    deleteFollowing(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/task-schedules/${id}/following`, {
            withCredentials: true
        });
    }

    getGoalProgress(): Observable<GoalProgress[]> {
        return this.http.get<GoalProgress[]>(`${this.baseUrl}/task-schedules/goal-progress`, {
            withCredentials: true
        });
    }
}