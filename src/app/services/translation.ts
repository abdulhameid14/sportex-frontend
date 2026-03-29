import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  constructor(public translate: TranslateService) {
  // Initialize translations once globally
  this.translate.addLangs(['en', 'ar']);
  // Default to English
  this.translate.setDefaultLang('en');
  const savedLang = localStorage.getItem('lang');
  const initialLang = savedLang && ['en', 'ar'].includes(savedLang) ? savedLang : 'en';
  this.useLanguage(initialLang);
}

  useLanguage(langOrEvent: string | Event) {
    let lang = '';
    if (typeof langOrEvent === 'string') {
      lang = langOrEvent;
    } else {
      const select = langOrEvent.target as HTMLSelectElement;
      lang = select.value;
    }
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
    // Handle direction
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }
}
