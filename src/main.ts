import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { TranslateService } from '@ngx-translate/core';

bootstrapApplication(App, appConfig)
  .then(appRef => {
    const translate = appRef.injector.get(TranslateService);

    // Define supported languages
    translate.addLangs(['en', 'ar']);
    translate.setDefaultLang('en');

    // Load saved or browser language
    const savedLang = localStorage.getItem('lang');
    const browserLang = translate.getBrowserLang();

    const lang = savedLang || (browserLang?.match(/ar|en/) ? browserLang : 'en');

    translate.use(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  })
  .catch(err => console.error(err));
