import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../services/auth';

export const SKIP_AUTH_REDIRECT = new HttpContextToken<boolean>(() => false);

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(Auth);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.context.get(SKIP_AUTH_REDIRECT)) {
        authService.clearAppUserSession();
        router.navigate(['login']);
      }

      return throwError(() => error);
    }),
  );
};
