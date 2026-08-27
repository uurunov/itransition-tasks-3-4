import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AvatarModule } from '@openng/optimus-ui/avatar';
import { ChipModule } from '@openng/optimus-ui/chip';
import { PanelModule } from '@openng/optimus-ui/panel';
import { ButtonModule } from '@openng/optimus-ui/button';

@Component({
  imports: [AvatarModule, ChipModule, PanelModule, ButtonModule],
  selector: 'app-email-confirmed',
  styleUrl: './email-confirmed.css',
  templateUrl: './email-confirmed.html',
})
export class EmailConfirmed {
  private router = inject(Router);

  onSignIn() {
    this.router.navigate(['login']);
  }
}
