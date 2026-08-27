import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AppUser {
  name: string;
  email: string;
  status: number;
}

@Service()
export class Auth {
  private http = inject(HttpClient);
  isAuthenticated = signal(false);
  currentUser = signal<AppUser | null>(null);

  authenticate(request: LoginRequest) {
    return this.http.post<AppUser>('/api/Auth/login', request).pipe(
      tap((user) => {
        this.isAuthenticated.set(true);
        this.currentUser.set(user);
      }),
    );
  }

  register(request: RegisterRequest) {
    return this.http.post('/api/Auth/register', request);
  }

  checkStatus() {
    return this.http.get<AppUser>('/api/Auth/me').pipe(
      tap((user) => {
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      }),
      catchError(() => {
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
        return of(null);
      }),
    );
  }

  logout() {
    return this.http.post('/api/Auth/logout', {}).pipe(
      tap(() => {
        this.isAuthenticated.set(false);
        this.currentUser.set(null);
      }),
    );
  }

  confirmEmail(userId: string, token: string) {
    return this.http.post('/api/Auth/confirm-email', { userId, token });
  }
}
