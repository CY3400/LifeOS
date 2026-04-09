import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  userId: number;
  email: string;
  role: string;
  message: string;
};

export type MeResponse = {
  userId: number;
  email: string;
  role: string;
};

export type Goal = {
    id: number,
    title: string
}

export type Task = {
    id: number,
    title: string,
    goalId: number | null
}

export type TaskSchedule = {
    id: number,
    taskId: number,
    taskDate: string,
    startTime: string | null,
    endTime: string | null,
    completed: boolean
}

export type Dashboard = {
    goals: Goal[]
    tasks: Task[]
    totalTasks: number
    completedTasks: number
    completionRate: number
}

@Injectable({
  providedIn: 'root'
})
export class Api {
    private baseUrl = 'http://localhost:8080/api';

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
        return this.http.post<boolean>(`${this.baseUrl}/auth/verify`, email, {
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

    addGoal(title: string): Observable<Goal> {
        return this.http.post<Goal>(`${this.baseUrl}/goals`, { title }, {
            withCredentials: true
        });
    }

    modifyGoal(id: number, title: string): Observable<Goal> {
        return this.http.put<Goal>(`${this.baseUrl}/goals/${id}`, { title }, {
            withCredentials: true
        });
    }

    deleteGoal(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/goals/${id}`, {
            withCredentials: true
        });
    }

    createTask(title: string, goalId: number | null): Observable<Task> {
        return this.http.post<Task>(`${this.baseUrl}/tasks`, { title, goalId }, {
            withCredentials: true
        });
    }

    updateTask(id: number, title: string, goalId: number | null): Observable<Task> {
        return this.http.put<Task>(`${this.baseUrl}/tasks/${id}`, { title, goalId }, {
            withCredentials: true
        });
    }

    deleteTask(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/tasks/${id}`, {
            withCredentials: true
        });
    }

    getTaskSchedulesByDate(taskDate: string): Observable<TaskSchedule[]> {
        return this.http.get<TaskSchedule[]>(`${this.baseUrl}/task-schedules/date/${taskDate}`, {
            withCredentials: true
        });
    }

    createTaskSchedule(taskId: number, taskDate: string, startTime: string | null, endTime: string | null): Observable<TaskSchedule> {
        return this.http.post<TaskSchedule>(`${this.baseUrl}/task-schedules`, { taskId, taskDate, startTime, endTime }, {
            withCredentials: true
        });
    }

    updateTaskSchedule(id: number, taskId: number, taskDate: string, startTime: string | null, endTime: string | null): Observable<TaskSchedule> {
        return this.http.put<TaskSchedule>(`${this.baseUrl}/task-schedules/${id}`, { taskId, taskDate, startTime, endTime }, {
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

    repeatTaskSchedules(taskId: number, startDate: string, endDate: string, startTime: string | null, endTime: string | null, daysChosen: number[]): Observable<TaskSchedule[]> {
        return this.http.post<TaskSchedule[]>(`${this.baseUrl}/task-schedules/repeat`, { taskId, startDate, endDate, startTime, endTime, daysChosen }, {
            withCredentials: true
        });
    }
}