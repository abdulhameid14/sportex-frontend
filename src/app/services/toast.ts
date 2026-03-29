import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  message = signal<string>('');
  type = signal<'success' | 'error' | ''>('');
  isOpen = signal<boolean>(false);

  show(message: string, type: 'success' | 'error' = 'success') {
    this.message.set(message);
    this.type.set(type);
    this.isOpen.set(true);
    setTimeout(() => this.isOpen.set(false), 2500); // auto-hide
  }
}
