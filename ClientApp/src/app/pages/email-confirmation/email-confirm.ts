import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AvatarModule } from '@openng/optimus-ui/avatar';
import { ChipModule } from '@openng/optimus-ui/chip';
import { PanelModule } from '@openng/optimus-ui/panel';
import { ButtonModule } from '@openng/optimus-ui/button';
import { ProgressSpinnerModule } from '@openng/optimus-ui/progressspinner';
import { Auth } from '../../services/auth';

@Component({
  imports: [AvatarModule, ChipModule, PanelModule, ButtonModule, ProgressSpinnerModule],
  selector: 'app-email-confirm',
  styleUrl: './email-confirm.css',
  templateUrl: './email-confirm.html',
})
export class EmailConfirm implements OnInit {
  private router = inject(Router);
  private authService = inject(Auth);
  private route = inject(ActivatedRoute);

  status = signal<'loading' | 'success' | 'failed'>('loading');

  ngOnInit(): void {
    const userId = this.route.snapshot.queryParamMap.get('userId');
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!userId || !token) {
      this.status.set('failed');
      return;
    }

    this.authService.confirmEmail(userId, token).subscribe({
      next: () => this.status.set('success'),
      error: (err) => {
        this.status.set('failed');
      },
    });
  }

  onSignIn() {
    this.router.navigate(['login']);
  }
}
