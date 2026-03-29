import { Component, EventEmitter, Output, signal } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-logout-modal',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './logout-modal.html',
  styleUrl: './logout-modal.scss'
})
export class LogoutModal {
  isOpen = signal(false);
  @Output() closed = new EventEmitter<void>();

  constructor(private authService: Auth, private route: Router) {}


  open() {
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
    this.closed.emit();
  }

  onLogout(){
    console.log('logging out');
    this.route.navigateByUrl('login');
    this.authService.logout();
  }
}
