import { DecimalPipe } from "@angular/common";
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

export type DailyTask = {
    id: number,
    title: string,
    completed: boolean,
    taskDate: string,
    startTime: string | null,
    endTime: string | null,
    goalId: number | null
}

export type Dashboard = {
    goals: Goal[]
    dailyTasks: DailyTask[]
    totalTasks: number,
    completedTasks: number,
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
}