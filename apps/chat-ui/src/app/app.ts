import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ChatComponent } from './components';

@Component({
  imports: [ChatComponent, RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'chat-ui';
}
