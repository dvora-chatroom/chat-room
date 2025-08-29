import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessage, POETBOT_NAME } from '@chat-room/shared';
import { FormatMessagePipe } from '../../pipes/format-message.pipe';

@Component({
  selector: 'app-message-item',
  standalone: true,
  imports: [CommonModule, FormatMessagePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './message-item.component.html',
  styleUrls: ['./message-item.component.scss']
})
export class MessageItemComponent {
  @Input() message!: ChatMessage;
  @Input() isOwnMessage: boolean = false;
  
  readonly POETBOT_NAME = POETBOT_NAME;
}
