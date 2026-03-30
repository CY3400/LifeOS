import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class Api {
    private baseUrl = 'http://localhost:8080/api';

    constructor(private http: HttpClient){}

    logout(): Observable<any>{
        return this.http.post(`${this.baseUrl}/auth/logout`, {}, {
            withCredentials: true
        });
    }

    register(user: any): Observable<any>{
        return this.http.post(`${this.baseUrl}/auth/register`, user, {
            withCredentials: true
        });
    }

    verify(email: string): Observable<any>{
        return this.http.post(`${this.baseUrl}/auth/verify`, email, {
            withCredentials: true
        });
    }

    me(): Observable<any> {
        return this.http.get(`${this.baseUrl}/auth/me`, {
            withCredentials: true
        });
    }
}