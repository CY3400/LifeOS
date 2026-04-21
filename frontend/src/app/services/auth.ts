import { Injectable } from '@angular/core';
import { Api } from './api';
import { catchError, map, Observable, of, tap } from 'rxjs';

type CurrentUser = {
  id?: number;
  email?: string;
  role?: string;
  [key: string]: unknown;
};

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private currentUser: CurrentUser | null = null;

  constructor(private api: Api) {}

  getCurrentUser(): CurrentUser | null {
    return this.currentUser;
  }

  getRole(): string | null {
    return this.currentUser?.role ?? null;
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  isUser(): boolean {
    return this.getRole() === 'USER';
  }

  loadCurrentUser(): Observable<CurrentUser | null> {
    return this.api.me().pipe(
      tap((user) => {
        this.currentUser = user as CurrentUser;
      }),
      map((user) => user as CurrentUser),
      catchError(() => {
        this.clearSession();
        return of(null);
      })
    );
  }

  ensureCurrentUser(): Observable<CurrentUser | null> {
    if (this.currentUser) {
        return of(this.currentUser);
    }

    return this.loadCurrentUser();
  }

  isAuthenticated(): Observable<boolean> {
    return this.ensureCurrentUser().pipe(
        map((user) => user !== null)
    );
  }

  clearSession(): void {
    this.currentUser = null;
  }
}