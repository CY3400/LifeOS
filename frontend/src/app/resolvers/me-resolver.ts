import { ResolveFn, Router, UrlTree } from '@angular/router';
import { Api, MeResponse } from '../services/api';
import { inject } from '@angular/core';
import { catchError, of } from 'rxjs';

export const MeResolver: ResolveFn<MeResponse | UrlTree> = () => {
  const api = inject(Api);
  const router = inject(Router);

  return api.me().pipe(
    catchError(() => of(router.parseUrl('/se-connecter')))
  );
};