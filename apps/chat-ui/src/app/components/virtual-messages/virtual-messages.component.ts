import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessage } from '@chat-room/shared';
import { MessageItemComponent } from '../message-item/message-item.component';
import { Subject, takeUntil, debounceTime } from 'rxjs';

@Component({
  selector: 'app-virtual-messages',
  standalone: true,
  imports: [CommonModule, MessageItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './virtual-messages.component.html',
  styleUrls: ['./virtual-messages.component.scss']
})
export class VirtualMessagesComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() messages: ChatMessage[] = [];
  @Input() currentUserName: string = '';
  @Input() itemHeight: number = 80; // Estimated height per message
  @Input() bufferSize: number = 5; // Number of items to render outside viewport
  
  @Output() scrollToBottom = new EventEmitter<void>();
  
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  visibleMessages: ChatMessage[] = [];
  totalHeight: number = 0;
  offsetY: number = 0;
  
  private destroy$ = new Subject<void>();
  private scroll$ = new Subject<void>();

  ngAfterViewInit(): void {
    this.setupScrollDebounce();
    this.updateVisibleMessages();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['messages']) {
      // Always show all messages for now to avoid virtual scrolling issues
      this.visibleMessages = [...this.messages];
      this.totalHeight = this.messages.length * this.itemHeight;
      
      // Auto-scroll to bottom for new messages
      if (changes['messages'].currentValue.length > (changes['messages'].previousValue?.length || 0)) {
        // Use multiple timeouts to ensure DOM is updated
        setTimeout(() => {
          this.scrollToBottomManually();
        }, 50);
        
        // Double-check scroll after a longer delay
        setTimeout(() => {
          this.scrollToBottomManually();
        }, 200);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupScrollDebounce(): void {
    this.scroll$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(16) // ~60fps
      )
      .subscribe(() => {
        this.updateVisibleMessages();
      });
  }

  onScroll(): void {
    this.scroll$.next();
  }

  private updateVisibleMessages(): void {
    if (!this.scrollContainer?.nativeElement || this.messages.length === 0) {
      this.visibleMessages = [];
      this.totalHeight = 0;
      this.offsetY = 0;
      return;
    }

    // For now, show all messages to avoid virtual scrolling issues
    this.visibleMessages = [...this.messages];
    this.totalHeight = this.messages.length * this.itemHeight;
  }

  trackByMessage(index: number, message: ChatMessage): string {
    return message.id;
  }

  // Public method to scroll to bottom
  scrollToBottomManually(): void {
    if (this.scrollContainer?.nativeElement) {
      const container = this.scrollContainer.nativeElement;
      // Use smooth scrolling for better UX
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }
}
