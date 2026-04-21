import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Auth } from '../services/auth';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(private auth: Auth, private router: Router) {}

    canActivate(): Observable<boolean | UrlTree> {
        return this.auth.isAuthenticated().pipe(
            map((isAuthenticated) =>
                isAuthenticated ? true : this.router.createUrlTree(['/se-connecter'])
            ),
            catchError(() =>
                of(this.router.createUrlTree(['/se-connecter']))
            )
        );
    }
}