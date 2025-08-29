import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { User, ChatMessage, TypingUser } from '@chat-room/shared';

import { VirtualMessagesComponent } from '../virtual-messages/virtual-messages.component';
import { Subscription, takeUntil, Subject } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, VirtualMessagesComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('virtualMessages') virtualMessages!: VirtualMessagesComponent;

  currentUser: User | null = null;
  users: User[] = [];
  messages: ChatMessage[] = [];
  typingUsers: TypingUser[] = [];
  userName: string = '';
  newMessage: string = '';
  isConnected: boolean = false;
  
  private typingTimeout: any;
  private destroy$ = new Subject<void>();
  private scrollToBottomScheduled = false;

  constructor(
    private chatService: ChatService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    // Use takeUntil for automatic unsubscription
    this.chatService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.cdr.markForCheck();
      });

    this.chatService.users$
      .pipe(takeUntil(this.destroy$))
      .subscribe(users => {
        this.users = users;
        this.cdr.markForCheck();
      });

        this.chatService.messages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(messages => {
        this.messages = messages;
        this.cdr.markForCheck();
        
        // Auto-scroll to bottom when new messages arrive
        this.scheduleScrollToBottom();
      });

    this.chatService.typingUsers$
      .pipe(takeUntil(this.destroy$))
      .subscribe(typingUsers => {
        this.typingUsers = typingUsers;
        this.cdr.markForCheck();
      });

    this.chatService.connectionStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.isConnected = status;
        this.cdr.markForCheck();
      });
  }

  ngAfterViewChecked(): void {
    if (this.scrollToBottomScheduled) {
      this.scrollToBottom();
      this.scrollToBottomScheduled = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

  // TrackBy functions for optimal change detection
  trackByUser(index: number, user: User): string {
    return user.socketId;
  }

  trackByMessage(index: number, message: ChatMessage): string {
    return message.id;
  }

  trackByTypingUser(index: number, typingUser: TypingUser): string {
    return typingUser.user;
  }

  joinChat(): void {
    if (this.userName.trim()) {
      this.chatService.joinChat(this.userName);
    }
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      this.chatService.sendMessage(this.newMessage);
      this.newMessage = '';
      this.chatService.sendTyping(false);
      this.cdr.markForCheck();
      
      // Immediately schedule scroll to bottom when user sends a message
      this.scheduleScrollToBottom();
    }
  }

  onTyping(): void {
    this.chatService.sendTyping(true);
    
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    
    this.typingTimeout = setTimeout(() => {
      this.chatService.sendTyping(false);
    }, 1000);
  }

  leaveChat(): void {
    this.chatService.disconnect();
    this.userName = '';
    this.cdr.markForCheck();
  }

  onScrollToBottom(): void {
    // Handle scroll to bottom event from virtual messages
    this.scheduleScrollToBottom();
  }

  private scheduleScrollToBottom(): void {
    this.scrollToBottomScheduled = true;
    // Force change detection to trigger ngAfterViewChecked
    this.cdr.detectChanges();
  }

  private scrollToBottom(): void {
    try {
      if (this.virtualMessages) {
        this.virtualMessages.scrollToBottomManually();
      }
    } catch (err) {
      console.warn('Failed to scroll to bottom:', err);
    }
  }
}
