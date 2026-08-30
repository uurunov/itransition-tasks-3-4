import { Routes } from '@angular/router';
import { guestGuard } from './guards/guest-guard';
import { userGuard } from './guards/user-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((page) => page.Login),
    canActivate: [guestGuard],
    title: 'Sign in',
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/signup/signup').then((page) => page.Signup),
    canActivate: [guestGuard],
    title: 'Sign up',
  },
  {
    path: 'email-confirmation',
    loadComponent: () =>
      import('./pages/email-confirmation/email-confirm').then((page) => page.EmailConfirm),
    canActivate: [guestGuard],
    title: 'Confirm your email',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then((page) => page.Dashboard),
    canActivate: [userGuard],
    title: 'Dashboard',
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
