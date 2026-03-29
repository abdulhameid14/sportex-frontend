import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader, TRANSLATE_HTTP_LOADER_CONFIG } from '@ngx-translate/http-loader';
import { WebsocketService } from './services/websocket-service';

import { MatSnackBarModule } from '@angular/material/snack-bar';

export function HttpLoaderFactory() {
  return new TranslateHttpLoader();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withRouterConfig({
        onSameUrlNavigation: 'reload'
      })
    ),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    WebsocketService,
    importProvidersFrom(MatSnackBarModule),

    // Translation setup
      importProvidersFrom(
      TranslateModule.forRoot({
        // `defaultLanguage` is deprecated — use `fallbackLang` to provide a fallback
        fallbackLang: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [],
        },
      })
    ),

    // Required configuration for TranslateHttpLoader
    {
      provide: TRANSLATE_HTTP_LOADER_CONFIG,
      useValue: {
        prefix: '/i18n/',
        suffix: '.json'
      },
    },
  ],
};
