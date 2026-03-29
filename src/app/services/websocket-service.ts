import { create } from 'domain';
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../environments/environment';
import { Auth } from './auth';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private socket!: Socket;
  private connected = false;
  private notificationSubject = new Subject<any>();

  // Observable to subscribe from components
  get notifications$(): Observable<any> {
    return this.notificationSubject.asObservable();
  }
  // Subjects for different socket events
  private messageSubject = new Subject<any>();        // 'dm:new'
  private readAckSubject = new Subject<any>();        // 'dm:read:ack'
  private connectionSubject = new Subject<boolean>(); // connection status
  notifications: any[] = []; // local notification list

  constructor(private auth: Auth, private snackBar: MatSnackBar) { }

  /**
   * Initialize Socket.IO connection
   */

  createSocket() {
    const token = this.auth.getToken();
    const url = environment.socketUrl;

    if (this.socket) {
      this.socket.off('connect');
      this.socket.off('disconnect');
      this.socket.off('connect_error');
      this.socket.off('dm:new');
      this.socket.off('dm:read:ack');
      this.socket.off('forceLogout');
    }

    console.log('🔌 Connecting to WebSocket:', url);
    console.log('Using token:', token ? '✅ Provided' : '❌ Not provided');

    this.socket = io(url, {
      auth: { token },
      path: '/socket.io',
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      transports: ['websocket'],
    });
    this.registerSocketEvents();

  }
  registerSocketEvents() {
    // --- Connection Events ---
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.connected = true;
      this.connectionSubject.next(true);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('⚠️ Socket disconnected:', reason);
      this.connected = false;
      this.connectionSubject.next(false);
      if ((reason as any) === 'forceLogout') {
        this.auth.logout();
      }
    });

    this.socket.on('connect_error', (err: any) => {
      console.error('❌ Socket connect_error:', err.message);
    });

    // --- Message Events ---
    this.socket.on('dm:new', (payload) => {
      console.log('📩 New DM received:', payload);
      this.messageSubject.next(payload);
    });

    this.socket.on('dm:read:ack', (payload) => {
      console.log('📖 Read ACK received:', payload);
      this.readAckSubject.next(payload);
    });

    this.socket.on('forceLogout', (payload: { reason?: string }, ack?: () => void) => {
      console.warn('🚫 Force logout received:', payload?.reason || 'No reason provided');
      this.auth.logout();
      if (ack) ack();
    });

    this.socket.onAny((event, ...args) => {
      console.log('📡 Socket event:', event, args);
    });
    // In your component

    this.socket.on('notification', (data) => {
      console.log('🔔 Notification received:', data);

      // Show snackbar
      this.snackBar.open(
        "Title: " + data.title + " Content: " + data.message,
        'Close',
        {
          duration: 5000,
          verticalPosition: 'top',
          panelClass: ['custom-snackbar']
        }
      );

      this.notifications.push({
        title: data.title,
        message: data.message,
        receivedAt: new Date() // optional: timestamp
      });

      // Save updated notifications to localStorage
      localStorage.setItem('notifications', JSON.stringify(this.notifications));
      const newNotification = {
        title: data.title,
        message: data.message,
        receivedAt: new Date(),// optional: timestamp
        active: true
      };
      this.notificationSubject.next(newNotification);


      console.log('📌 Notification list:', this.notifications);
    });
  }
  public init() {
    if (typeof window !== 'undefined') {
      try {
        const savedNotifications = localStorage.getItem('notifications');
        this.notifications = savedNotifications ? JSON.parse(savedNotifications) : [];
        console.log(this.notifications);

      } catch (err) {
        console.error('Failed to read notifications from localStorage', err);
        this.notifications = [];
      }
    }
    if (this.socket && this.connected) {
      console.log('🔁 Socket already connected');
      return;
    }

    if (!this.socket) {
      this.createSocket();
    }






  }


  /**
   * Send a direct message
   */

  sendDirectMessage(toUserId: string, content: string, clientId?: string, attachments?: any[]) {
    if (!this.connected || !this.socket) {
      console.warn('⚠️ Cannot send message — socket not connected');
      return;
    }

    const payload = { toUserId, content, clientId, attachments };
    this.socket.emit('dm:send', payload, (response: any) => {
      if (!response?.ok) {
        console.error('❌ Failed to send DM:', response?.error);
      } else {
        console.log('✅ DM sent successfully:', response?.message);
      }
    });
  }
  sendNotification(title: string, content: string, data: any, employees: any[]) {
    if (!this.connected || !this.socket) {
      console.warn('⚠️ Cannot send notification — socket not connected');
      return;
    }
    console.log("data : ", data);
    let type = '';
    let tenantId;
    let departmentId;
    let employeesId;
    if (data.branchName) {
      type = 'tenant';
      tenantId = data.branchName;
    }
    if (data.departmentId) {
      type = 'department';
      departmentId = data.departmentId;
    }
    if (employees && employees.length > 0) {
      type = 'employees';
      employeesId = employees.map((e: any) => e.id);
    }
    const payload = { title, message: content, type, tenantId, departmentId, employees: employeesId };
    this.socket.emit('notification', payload, (response: any) => {
      if (!response?.ok) {
        console.error('❌ Failed to send notification:', response?.error);
      } else {
        console.log('✅ Notification sent successfully:', response?.notification);
      }
    });

  }

  /**
   * Mark a conversation as read
   */
  markConversationAsRead(conversationId: string) {
    if (this.connected && this.socket) {
      this.socket.emit('dm:read', { conversationId });
    } else {
      console.warn('⚠️ Socket not connected — cannot mark as read');
    }
  }

  /**
   * Observables for components to subscribe to
   */
  onNewMessage(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  onReadAck(): Observable<any> {
    return this.readAckSubject.asObservable();
  }

  onConnectionChange(): Observable<boolean> {
    return this.connectionSubject.asObservable();
  }

  /**
   * Helper methods
   */
  isConnected(): boolean {
    return this.connected;
  }

  disconnect() {
    if (this.socket) {
      try {
        this.socket.disconnect();
      } catch (err) {
        console.error('Error during socket disconnect:', err);
      }
    }
    this.connected = false;
  }



}
