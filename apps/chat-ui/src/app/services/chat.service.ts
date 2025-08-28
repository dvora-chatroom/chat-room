import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable, Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { User, ChatMessage, TypingUser, ChatEvents } from '@chat-room/shared';

@Injectable({
  providedIn: 'root'
})
export class ChatService implements OnDestroy {
  private socket: Socket | null = null;
  private usersSubject = new BehaviorSubject<User[]>([]);
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  private typingUsersSubject = new BehaviorSubject<TypingUser[]>([]);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  
  private destroy$ = new Subject<void>();
  private typingDebounce$ = new Subject<boolean>();

  public users$ = this.usersSubject.asObservable();
  public messages$ = this.messagesSubject.asObservable();
  public typingUsers$ = this.typingUsersSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  constructor() {
    this.setupTypingDebounce();
  }

  private setupTypingDebounce(): void {
    this.typingDebounce$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(isTyping => {
        if (this.socket?.connected) {
          this.socket.emit(ChatEvents.Typing, isTyping);
        }
      });
  }

  private initializeSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to chat server');
      this.connectionStatusSubject.next(true);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
      this.connectionStatusSubject.next(false);
    });

    this.socket.on(ChatEvents.Users, (users: User[]) => {
      this.usersSubject.next(users);
    });

    this.socket.on(ChatEvents.NewMessage, (message: ChatMessage) => {
      const currentMessages = this.messagesSubject.value;
      // Only add if message doesn't already exist (prevent duplicates)
      if (!currentMessages.find(m => m.id === message.id)) {
        this.messagesSubject.next([...currentMessages, message]);
      }
    });

    this.socket.on(ChatEvents.Messages, (messages: ChatMessage[]) => {
      this.messagesSubject.next(messages);
    });

    this.socket.on(ChatEvents.UserJoined, (user: User) => {
      console.log(`${user.name} joined the chat`);
    });

    this.socket.on(ChatEvents.UserLeft, (user: User) => {
      console.log(`${user.name} left the chat`);
    });

    this.socket.on(ChatEvents.UserTyping, (typingUser: TypingUser) => {
      const currentTypingUsers = this.typingUsersSubject.value;
      const existingIndex = currentTypingUsers.findIndex(u => u.user === typingUser.user);
      
      if (typingUser.isTyping) {
        if (existingIndex === -1) {
          this.typingUsersSubject.next([...currentTypingUsers, typingUser]);
        }
      } else {
        if (existingIndex !== -1) {
          const updatedTypingUsers = currentTypingUsers.filter(u => u.user !== typingUser.user);
          this.typingUsersSubject.next(updatedTypingUsers);
        }
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.connectionStatusSubject.next(false);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      this.connectionStatusSubject.next(true);
    });
  }

  joinChat(userName: string): void {
    if (userName && userName.trim()) {
      if (!this.socket) {
        this.initializeSocket();
      }
      
      // Wait for socket to be connected before joining
      if (this.socket?.connected) {
        this.performJoin(userName.trim());
      } else {
        // If socket is not connected yet, wait for connection
        this.socket?.once('connect', () => {
          this.performJoin(userName.trim());
        });
      }
    }
  }

  private performJoin(userName: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join', userName);
      const user: User = { name: userName, socketId: this.socket.id || '' };
      this.currentUserSubject.next(user);
    }
  }

  sendMessage(message: string): void {
    if (message && message.trim() && this.socket?.connected) {
      this.socket.emit('message', message.trim());
    }
  }

  sendTyping(isTyping: boolean): void {
    this.typingDebounce$.next(isTyping);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.currentUserSubject.next(null);
    this.usersSubject.next([]);
    this.messagesSubject.next([]);
    this.typingUsersSubject.next([]);
    this.connectionStatusSubject.next(false);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Performance optimization: Get current state without subscription
  getCurrentUsers(): User[] {
    return this.usersSubject.value;
  }

  getCurrentMessages(): ChatMessage[] {
    return this.messagesSubject.value;
  }

  // Clear old messages to prevent memory issues
  clearOldMessages(maxCount: number = 100): void {
    const currentMessages = this.messagesSubject.value;
    if (currentMessages.length > maxCount) {
      const recentMessages = currentMessages.slice(-maxCount);
      this.messagesSubject.next(recentMessages);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnect();
  }
}
