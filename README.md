# Chat Room Application

A real-time chat application built with Angular 19, Node.js, WebSocket, and OpenAI integration.

## Features

- **Real-time Chat**: WebSocket-based messaging with Socket.IO
- **AI Assistant**: PoetBot powered by OpenAI GPT-4o-mini
- **Code Highlighting**: Automatic syntax highlighting for code blocks
- **User Management**: Real-time user presence and typing indicators
- **Responsive Design**: Modern UI with mobile support
- **Performance Optimized**: Virtual scrolling, change detection optimization

## Tech Stack

### Frontend
- **Angular 19** - Modern Angular with standalone components
- **TypeScript** - Type-safe development
- **Socket.IO Client** - Real-time communication
- **RxJS** - Reactive programming
- **SCSS** - Advanced styling with CSS preprocessor

### Backend
- **Node.js** - Server runtime
- **Express** - Web framework
- **Socket.IO** - Real-time WebSocket communication
- **OpenAI API** - AI-powered responses
- **TypeScript** - Type-safe server development

### Architecture
- **Nx Monorepo** - Scalable monorepo architecture
- **Shared Libraries** - Reusable code across apps
- **WebSocket** - Real-time bidirectional communication

## Project Structure

```
chat-room/
├── apps/
│   ├── chat-api/          # Node.js Express server
│   └── chat-ui/           # Angular 19 frontend
├── libs/
│   ├── bot/              # OpenAI bot logic
│   └── shared/           # Shared types and utilities
├── .env                  # Environment variables
└── README.md            # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chat-room
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the development servers**

   **Terminal 1 - Backend:**
   ```bash
   npx nx serve chat-api
   ```

   **Terminal 2 - Frontend:**
   ```bash
   npx nx serve chat-ui
   ```

5. **Open your browser**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:3001

## Usage

1. **Join Chat**: Enter your name and click "Join Chat"
2. **Send Messages**: Type your message and press Enter or click Send
3. **AI Assistant**: Ask technical questions and PoetBot will respond in rhyme
4. **Code Blocks**: Messages with code will be automatically highlighted

## Development

### Available Commands

```bash
# Build applications
npx nx build chat-api
npx nx build chat-ui

# Run tests
npx nx test chat-api
npx nx test chat-ui

# Lint code
npx nx lint chat-api
npx nx lint chat-ui

# Generate new components
npx nx generate @nx/angular:component my-component --project=chat-ui

# Generate new libraries
npx nx generate @nx/js:library my-library
```

### Code Structure

- **Components**: Located in `apps/chat-ui/src/app/components/`
- **Services**: Located in `apps/chat-ui/src/app/services/`
- **Pipes**: Located in `apps/chat-ui/src/app/pipes/`
- **Server Logic**: Located in `apps/chat-api/src/`
- **Shared Code**: Located in `libs/`

## Features in Detail

### PoetBot AI Assistant
- **Two-step Process**: Classification + Answer generation
- **Poetic Responses**: All answers in rhyme format
- **Tech Focus**: Specialized in web development questions
- **Cooldown System**: Prevents spam with 10-second cooldown

### Real-time Features
- **Live Messaging**: Instant message delivery
- **User Presence**: See who's online
- **Typing Indicators**: Know when someone is typing
- **Auto-scroll**: Automatically scrolls to new messages

### Code Display
- **Syntax Highlighting**: Automatic language detection
- **Inline Code**: Single backtick support
- **Code Blocks**: Triple backtick support
- **Responsive**: Horizontal scrolling for long code

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `PORT` | Server port (default: 3001) | No |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please open an issue on GitHub.
