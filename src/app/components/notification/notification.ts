import { Component, EventEmitter, OnInit, signal, Output } from '@angular/core';
import { IAnnouncement } from '../../interfaces/IAnnouncement.js';
import { Announcement } from './../../services/announcement';
import { Auth } from '../../services/auth.js';
import { Branch } from '../../services/branch.js';
import { WebsocketService } from '../../services/websocket-service.js';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [],
  templateUrl: './notification.html',
  styleUrl: './notification.scss'
})
export class Notification implements OnInit {
  isOpen = signal(false);
  @Output() closed = new EventEmitter<void>();
  @Output() countChanged = new EventEmitter<number>();
  notifications: any[] = [];

  constructor(private websocketService: WebsocketService, private authService: Auth) { }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      try {
        const savedNotifications = localStorage.getItem('notifications');
        if (savedNotifications) {
          this.notifications = JSON.parse(savedNotifications);
        }
      } catch (error) {
        console.error('Failed to read notifications from localStorage', error);
      }
    }
    if (this.authService.isLoggedIn()) {
      this.countChanged.emit(this.notifications.filter(n => n.active).length);
      this.websocketService.notifications$.subscribe((newNotification) => {
        this.notifications = [newNotification, ...this.notifications]; // prepend new
        this.countChanged.emit(this.notifications.filter(n => n.active).length);
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
      });
    }

  }

  open() {
    this.isOpen.set(true);
    // get current announcements
    const current = this.notifications;
    // update the announcements in the backend (only active ones)
    current.filter(a => a.active).forEach(a => {
      const updatedAnn = { ...a, active: false }; // ensure you send correct data

    });
    // mark all as inactive locally
    const updated = current.map(a => ({ ...a, active: false }));
    this.notifications = updated;
    // reset the count
    localStorage.setItem('notifications', JSON.stringify(updated));
    this.countChanged.emit(0);
  }


  close() {
    this.isOpen.set(false);
    this.closed.emit();
  }
  clearNotifications() {
    this.notifications = [];
    this.countChanged.emit(0);
    localStorage.removeItem('notifications');
  }

}
