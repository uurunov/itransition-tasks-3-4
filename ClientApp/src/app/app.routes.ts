import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Signup } from './pages/signup/signup';
import { guestGuard } from './guards/guest-guard';
import { userGuard } from './guards/user-guard';
import { EmailConfirm } from './pages/email-confirmation/email-confirm';

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'register', component: Signup, canActivate: [guestGuard] },
  { path: 'email-confirmation', component: EmailConfirm, canActivate: [guestGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [userGuard] },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
