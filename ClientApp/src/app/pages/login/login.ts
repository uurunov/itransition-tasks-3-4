import { Component, inject, signal } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { MessageService } from '@openng/optimus-ui/api';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from '@openng/optimus-ui/button';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { MessageModule } from '@openng/optimus-ui/message';
import { IconFieldModule } from '@openng/optimus-ui/iconfield';
import { InputIconModule } from '@openng/optimus-ui/inputicon';
import { ChipModule } from '@openng/optimus-ui/chip';
import { AvatarModule } from '@openng/optimus-ui/avatar';
import { PasswordModule } from '@openng/optimus-ui/password';

@Component({
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    IconFieldModule,
    InputIconModule,
    ChipModule,
    AvatarModule,
    PasswordModule,
  ],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private authService = inject(Auth);
  private router = inject(Router);
  private messageService = inject(MessageService);

  email = signal('');
  password = signal('');
  errorMessage = signal('');
  isLoading = signal(false);

  onSubmit() {
    this.errorMessage.set('');
    this.isLoading.set(true);

    this.authService.authenticate({ email: this.email(), password: this.password() }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Hooray',
          detail: 'Login successful.',
        });
        this.router.navigate(['dashboard']);
      },
      error: (err) => {
        console.log(err);
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Oops',
          detail: 'Login failed.',
        });
        this.errorMessage.set(err.error?.message ?? 'Login failed. Please try again.');
      },
    });
  }

  onSignUp() {
    this.router.navigate(['register']);
  }
}
