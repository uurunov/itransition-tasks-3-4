import { Component, inject, signal } from '@angular/core';
import { AppUser, Auth } from '../../services/auth';
import { ToolbarModule } from '@openng/optimus-ui/toolbar';
import { ChipModule } from '@openng/optimus-ui/chip';
import { AvatarModule } from '@openng/optimus-ui/avatar';
import { ButtonModule } from '@openng/optimus-ui/button';
import { TooltipModule } from '@openng/optimus-ui/tooltip';
import { ConfirmationService, MessageService } from '@openng/optimus-ui/api';
import { Router } from '@angular/router';

@Component({
  imports: [ToolbarModule, ChipModule, AvatarModule, ButtonModule, TooltipModule],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private authService = inject(Auth);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  currentUser = signal<AppUser | null>(this.authService.currentUser());

  onLogout(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to log out?',
      header: 'Confirm',
      icon: 'pi pi-sign-out',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Log out',
        severity: 'danger',
      },

      accept: () => {
        this.authService.logout().subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Logged Out',
              detail: 'You have successfully logged out.',
            });
            this.router.navigate(['login']);
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Oops',
              detail: err.error?.message ?? 'Logout failed. Please try again.',
            });
          },
        });
      },
    });
  }
}
