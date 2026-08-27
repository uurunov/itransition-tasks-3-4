import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideOptimus } from '@openng/optimus-ui/config';
import Aura from '@openng/optimus-ui-themes/aura';
import { credentialInterceptor } from './interceptors/credential-interceptor';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Auth } from './services/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAppInitializer(async () => {
      const authService = inject(Auth);
      return firstValueFrom(authService.checkStatus());
    }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([credentialInterceptor])),
    provideOptimus({ theme: { preset: Aura } }),
  ],
};
