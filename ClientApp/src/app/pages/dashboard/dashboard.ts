import { Component, computed, debounced, inject, signal } from '@angular/core';
import { AppUser, Auth } from '../../services/auth';
import { ToolbarModule } from '@openng/optimus-ui/toolbar';
import { ChipModule } from '@openng/optimus-ui/chip';
import { AvatarModule } from '@openng/optimus-ui/avatar';
import { ButtonModule } from '@openng/optimus-ui/button';
import { TooltipModule } from '@openng/optimus-ui/tooltip';
import { CardModule } from '@openng/optimus-ui/card';
import { TableModule } from '@openng/optimus-ui/table';
import { IconFieldModule } from '@openng/optimus-ui/iconfield';
import { InputIconModule } from '@openng/optimus-ui/inputicon';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { ConfirmationService, MessageService } from '@openng/optimus-ui/api';
import { Router } from '@angular/router';
import { User, UserDto } from '../../services/user';
import { TimeagoPipe } from 'ngx-timeago';
import { DatePipe } from '@angular/common';
import { TagModule } from '@openng/optimus-ui/tag';
import { rxResource } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';

export enum UserStatusLabel {
  Unverified = 0,
  Active = 1,
  Blocked = 2,
}

@Component({
  imports: [
    ToolbarModule,
    ChipModule,
    AvatarModule,
    ButtonModule,
    TooltipModule,
    CardModule,
    TableModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    TimeagoPipe,
    DatePipe,
    TagModule,
    NgClass,
  ],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private authService = inject(Auth);
  private userService = inject(User);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  currentUser = signal<AppUser | null>(this.authService.currentUser());
  selectedUsers = signal<UserDto[]>([]);
  readonly UserStatusLabel = UserStatusLabel;
  search = signal<string>('');
  debouncedSearch = debounced(this.search, 400);

  usersResource = rxResource({
    params: () => this.debouncedSearch.value(),
    stream: ({ params }) => this.userService.getUsers(params),
  });

  users = computed(() => (this.usersResource.hasValue() ? this.usersResource.value() : []));
  hasUnverifiedUsers = computed(() =>
    this.users().some((u) => {
      console.log(this.users());

      return u.status === 0;
    }),
  );

  onToolbarActionBtn(action: string, event: Event) {
    const userIds = this.selectedUsers().map((user) => user.id);
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to ${action.split('-').join(' ')}?`,
      header: 'Confirm',
      icon: 'pi pi-sign-out',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Confirm',
        severity: 'danger',
      },

      accept: () => {
        this.userService.performToolbarAction(action, userIds).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `Action <${action.split('-').join(' ')}> is successful.`,
            });
            this.usersResource.reload();
            this.selectedUsers.set([]);
          },
          error: (err) => {
            console.log(err);
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: err.error?.message ?? `Action <${action.split('-').join(' ')}> is failed.`,
            });
          },
        });
      },
    });
  }

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
