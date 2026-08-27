import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { catchError, of, tap } from 'rxjs';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

@Service()
export class Auth {
  private http = inject(HttpClient);
  isAuthenticated = signal(false);

  authenticate(request: LoginRequest) {
    return this.http
      .post('/api/Auth/login', request)
      .pipe(tap(() => this.isAuthenticated.set(true)));
  }

  register(request: RegisterRequest) {
    return this.http.post('/api/Auth/register', request);
  }

  checkStatus() {
    return this.http.get('/api/Auth/me').pipe(
      tap((user: any) => {
        this.isAuthenticated.set(true);
      }),
      catchError(() => {
        this.isAuthenticated.set(false);
        return of(null);
      }),
    );
  }
}
