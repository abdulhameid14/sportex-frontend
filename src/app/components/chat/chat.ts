import { ChatService } from './../../services/chatservice';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewChatModal } from '../new-chat-modal/new-chat-modal';
import { Auth } from '../../services/auth';
import { TranslateModule } from '@ngx-translate/core';
import { WebsocketService } from '../../services/websocket-service';

interface IMessage {
  id?: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments?: any;
  createdAt?: string;
  readAt?: string | null;
  sender?: any;
}

interface IRoom {
  id: string;
  name: string;
  toUserId?: string;
  lastMessageContent?: string;
  particepants?: any[];
  unreadCount: number;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  templateUrl: './chat.html',
  styleUrls: ['./chat.scss'],
  imports: [CommonModule, FormsModule, DatePipe, NewChatModal, TranslateModule],
})
export class Chat implements OnInit, OnDestroy {
  messages: IMessage[] = [];
  rooms: IRoom[] = [];
  newMessage = '';
  activeRoomId: string | null = null;
  toUserId: string | null = null;
  activeRoomName = '';
  isModalOpen = false;
  employeeId: string | null = null;
  users: any[] = [];

  @ViewChild('chatContainer') chatContainer!: ElementRef;

  constructor(
    private authService: Auth,
    private chatService: ChatService,
    private cdr: ChangeDetectorRef,
    private websocket: WebsocketService
  ) { }

  ngOnInit(): void {
    this.employeeId = this.authService.getEmployeeIdFromCookie();
    console.log('👤 My Employee ID:', this.employeeId);

    // Connect socket
    this.websocket.init();

    // Listen for new messages
    this.websocket.onNewMessage().subscribe((payload: any) => {
      console.log("\n\n\n\NEW MESSAGE CHAT.TS \n\n\n");

      console.log('📩 New message via WebSocket:', payload);
      console.log('🏠 Current activeRoomId:', this.activeRoomId);
      console.log('👤 My employeeId:', this.employeeId);
      console.log('👤 other employeeId:', this.toUserId);



      const msg = payload.message;
      if (msg.conversationId === this.activeRoomId || ((this.activeRoomId?.trim() === '' || !this.activeRoomId || this.toUserId === this.activeRoomId) && msg.sender.id === this.employeeId)) {
        this.messages.unshift(msg);
        if ((this.activeRoomId?.trim() === '' || !this.activeRoomId || this.toUserId === this.activeRoomId) && msg.sender.id === this.employeeId) {
          this.activeRoomId = msg.conversationId;
          this.rooms.find(r => r.toUserId === this.toUserId)!.id = msg.conversationId;
          this.toUserId = null;
        }
        const room = this.rooms.find((r) => r.id === msg.conversationId);

        if (room) {
          room.lastMessageContent = msg.content;
        }
        this.cdr.detectChanges();
        this.scrollToBottom();
        this.markAsRead();
      } else {
        const room = this.rooms.find((r) => r.id === msg.conversationId);
        console.log(msg, this.rooms);

        console.log('🏠 Found room for incoming message:', room);

        if (room) {
          if (msg.senderId !== this.employeeId)
            room.unreadCount++;
          room.lastMessageContent = msg.content;
          this.cdr.detectChanges();
        };
      }
    });

    // Listen for read receipts
    this.websocket.onReadAck().subscribe(({ conversationId }: any) => {
      if (conversationId === this.activeRoomId) {
        this.messages = this.messages.map((m) => ({
          ...m,
          readAt: new Date().toISOString(),
        }));
        this.cdr.detectChanges();
      }
    });

    // Load chats
    this.loadChats();

    // Load users
    this.chatService.getAllUsers().subscribe({
      next: (data) => {
        this.users = (data.users || []).filter(
          (u: any) => u.employee && u.employee.id !== this.employeeId
        );
      },
      error: (err) => console.error('Error fetching users:', err),
    });
  }

  ngOnDestroy(): void {
    this.websocket.disconnect();
  }

  getAvatarClass(name: string): string {
    if (!name) return 'bg-blue';
    const firstChar = name.charAt(0).toLowerCase();
    return firstChar < 'n' ? 'bg-blue' : 'bg-green';
  }

  selectRoom(room: IRoom) {
    const other = room.particepants?.find((p: any) => p.employeeId !== this.employeeId);
    room.name = other?.employee?.name || room.name;

    this.activeRoomId = room.id || room.toUserId || null;
    this.toUserId = other?.employee?.id || room.toUserId || null;
    this.activeRoomName = room.name;
    this.messages = [];

    console.log(`🟢 Selected room: ${room.id}`);
    if (room.id) {
      this.chatService.getMessagesByConversation(room.id).subscribe({
        next: (res) => {
          const arr = res.messages || res.data || res || [];
          this.messages = arr;
          this.cdr.detectChanges();
          setTimeout(() => this.scrollToBottom(), 0);
        },
        error: (err) => console.error('❌ Error fetching messages:', err),
      });
    }
  }

  send(): void {
    if (!this.newMessage.trim() || (!this.activeRoomId && !this.toUserId)) return;

    console.log('📤 Sending message:', this.newMessage);

    this.websocket.sendDirectMessage(
      this.toUserId || '',
      this.newMessage,
      crypto.randomUUID()
    );

    this.newMessage = '';
    setTimeout(() => this.scrollToBottom(), 0);
  }

  markAsRead() {
    if (!this.activeRoomId) return;
    this.websocket.markConversationAsRead(this.activeRoomId);
  }

  scrollToBottom(): void {
    const container = this.chatContainer?.nativeElement;
    if (container) {
      container.scroll({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    }
  }

  openNewChatModal() {
    this.isModalOpen = true;
  }

  closeNewChatModal() {
    this.isModalOpen = false;
  }

  saveNewChat(user: any) {
    const existingRoom = this.rooms.find((r) => r.toUserId === user.employee?.id);
    if (existingRoom) {
      this.selectRoom(existingRoom);
      this.isModalOpen = false;
      return;
    }

    this.rooms.push({
      id: '',
      toUserId: user.employee?.id,
      name: user.employee?.name,
      unreadCount: 0,
    });

    this.toUserId = user.employee?.id;
    this.messages = [];
    this.isModalOpen = false;
  }

  loadChats(): void {
    this.chatService.getAllChats().subscribe({
      next: (data) => {
        const conversations = data.conversations || [];
        this.rooms = conversations.map((conv: any) => {
          const participants = conv?.participants || [];
          const other = participants.find((p: any) => p.employeeId !== this.employeeId);
          console.log('👥 Conversation participants:', participants);

          return {
            id: conv.id || '',
            particepants: participants,
            toUserId: other?.employee?.id || '',
            name: other?.employee?.name || 'Unknown',
            lastMessageContent: conv?.lastMessageContent || '',
            unreadCount: conv?.conversation?.unreadCount || 0,
          } as IRoom;
        });

        this.cdr.detectChanges();
      },
      error: (err) => console.error('❌ Error fetching chats:', err),
    });
  }

  closeActiveChat(): void {
    this.activeRoomId = null;
    this.activeRoomName = '';
    this.messages = [];
    this.toUserId = null;
  }
}
