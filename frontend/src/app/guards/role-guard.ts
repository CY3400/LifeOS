import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { Auth } from '../services/auth';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const expectedRole = route.data['role'] as string | undefined;

    return this.auth.ensureCurrentUser().pipe(
      map((user) => {
        if (!user) {
          return this.router.createUrlTree(['/se-connecter']);
        }

        if (!expectedRole) {
          return true;
        }

        return this.auth.getRole() === expectedRole
          ? true
          : this.router.createUrlTree(['/accueil']);
      }),
      catchError(() => of(this.router.createUrlTree(['/se-connecter'])))
    );
  }
}