import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../environments/environment';
import { IMessage } from '../interfaces/IMessage';
import { Auth } from './auth';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IUser } from '../interfaces/IUser';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket!: Socket;
  private connected = false;

  constructor(private auth: Auth, private httpClient: HttpClient) { }

  connect(): void {
    const token = this.auth.getToken();

    this.socket = io(environment.socketUrl, {
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      this.connected = true;
      console.log('✅ Connected to Socket.IO server:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('⚠️ Socket disconnected:', reason);
      this.connected = false;
      if ((<any>reason) === "forceLogout") {
        this.auth.logout();
      }
    });

    this.socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message);
    });
    this.socket.on("forceLogout", (payload: { reason?: string }, ack?: () => void) => {
      console.warn("⚠️ Force logout received:", payload?.reason || "No reason provided");
      this.auth.logout();
      if (ack) ack(); // ✅ send ack back to server so it can safely disconnect
    });
    this.socket.onAny((event, ...args) => {
      console.log("📡 Socket event:", event, args);
    });

  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.connected = false;
      console.log('🔌 Disconnected from Socket.IO');
    }
  }

  /**
   * Send a direct message to another user (employee)
   */
  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken(); // Ensure the JWT token is available
    if (!token) {
      throw new Error('No token found');
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getAllUsers(): Observable<any> {
    return this.httpClient.get<any>(`${environment.apiUrl}/chats/users`, { headers: this.getHeaders() });
  }
  getAllChats(): Observable<any> {
    return this.httpClient.get<any>(`${environment.apiUrl}/chats`, { headers: this.getHeaders() });
  }
  getMessagesByConversation(conversationId: string): Observable<any> {
    return this.httpClient.get<any>(
      `${environment.apiUrl}/chats/${conversationId}/messages`,
      { headers: this.getHeaders() }
    );
  }

  sendDirectMessage(toUserId: string, content: string, attachments: any[] = [], convId: String): void {
    if (!this.connected) {
      console.warn('⚠️ Socket not connected — message not sent');
      return;
    }

    const payload = {
      toUserId,
      convId,
      content,
      attachments,
      clientId: crypto.randomUUID()
    };

    this.socket.emit('dm:send', payload, (response: any) => {
      if (response?.ok) {
        console.log('📤 Message sent successfully:', response.message);
      } else {
        console.error('❌ Failed to send message:', response?.error);
      }
    });
  }

  /**
   * Mark conversation messages as read
   */
  markConversationAsRead(conversationId: string): void {
    if (!this.connected) {
      console.warn('⚠️ Socket not connected — cannot mark messages as read');
      return;
    }

    this.socket.emit('dm:read', { conversationId });
  }

  /**
   * Listen for new direct messages
   */
  onNewMessage(callback: (message: IMessage) => void): void {
    this.socket.on('dm:new', (payload) => {
      console.log('📩 New message received:', payload);
      callback(payload.message);
    });
  }

  /**
   * Listen for read receipts (dm:read:ack)
   */
  onReadAck(callback: (data: { conversationId: string; readBy?: string }) => void): void {
    this.socket.on('dm:read:ack', (payload) => {
      console.log('📖 Read acknowledgment received:', payload);
      callback(payload);
    });
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.connected;
  }
}
