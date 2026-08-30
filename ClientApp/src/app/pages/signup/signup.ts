import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from '@openng/optimus-ui/api';
import { Auth } from '../../services/auth';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from '@openng/optimus-ui/button';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { MessageModule } from '@openng/optimus-ui/message';
import { IconFieldModule } from '@openng/optimus-ui/iconfield';
import { InputIconModule } from '@openng/optimus-ui/inputicon';
import { ChipModule } from '@openng/optimus-ui/chip';
import { AvatarModule } from '@openng/optimus-ui/avatar';
import { PasswordModule } from '@openng/optimus-ui/password';
import { PanelModule } from '@openng/optimus-ui/panel';

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
    PanelModule,
  ],
  selector: 'app-signup',
  styleUrl: './signup.css',
  templateUrl: './signup.html',
})
export class Signup {
  private authService = inject(Auth);
  private router = inject(Router);
  private messageService = inject(MessageService);

  username = signal('');
  email = signal('');
  password = signal('');
  errorMessage = signal('');
  isLoading = signal(false);
  isSignUpSucceeded = signal(false);

  onSubmit() {
    this.errorMessage.set('');
    this.isLoading.set(true);

    this.authService
      .register({ name: this.username(), email: this.email(), password: this.password() })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.isSignUpSucceeded.set(true);
        },
        error: (err) => {
          console.log(err);
          this.isLoading.set(false);

          if (err.status === 400) {
            const errorMsg: { code: string; description: string }[] = err.error;
            this.errorMessage.set(errorMsg[0].description);
          } else {
            this.errorMessage.set(err.error?.message ?? 'Registration failed. Please try again.');
          }

          this.messageService.add({
            severity: 'error',
            summary: 'Failure',
            detail: 'Registration failed.',
          });
        },
      });
  }

  onSignIn() {
    this.router.navigate(['login']);
  }
}
