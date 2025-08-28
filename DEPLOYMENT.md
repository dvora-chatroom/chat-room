# Deployment Guide for Render

This guide will help you deploy your chat room application to Render.

## Prerequisites

- A Render account (free tier available)
- Your OpenAI API key
- Your GitHub repository connected to Render

## Environment Variables

Set these environment variables in your Render dashboard:

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Set to `production` | Yes |
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `PORT` | Server port (Render sets this automatically) | No |

## Deployment Steps

### 1. Connect to GitHub

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select your `chat-room` repository

### 2. Configure the Service

- **Name**: `chat-room-api` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Build Command**: `npm run build:production`
- **Start Command**: `npm start`

### 3. Set Environment Variables

In the Render dashboard, add these environment variables:

```
NODE_ENV=production
OPENAI_API_KEY=your_actual_openai_api_key_here
```

### 4. Deploy

Click "Create Web Service" and wait for the deployment to complete.

## Build Process

The deployment will:

1. **Install dependencies**: `npm install`
2. **Build API**: `nx build chat-api`
3. **Build UI**: `nx build chat-ui`
4. **Start server**: `npm start`

## Architecture

In production, the Node.js API server will:

- Serve the built Angular UI from `/dist/apps/chat-ui/`
- Handle WebSocket connections for real-time chat
- Process OpenAI API requests for PoetBot
- Serve the SPA (Single Page Application) for all routes

## Health Check

The application includes a health check endpoint at `/health` that returns:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "connectedUsers": 5,
  "totalMessages": 150
}
```

## Troubleshooting

### Common Issues

1. **Build fails**: Check that all dependencies are in `package.json`
2. **OpenAI errors**: Verify your API key is set correctly
3. **WebSocket issues**: Ensure CORS is configured properly
4. **UI not loading**: Check that the build path is correct

### Logs

View deployment logs in the Render dashboard to debug issues.

## Custom Domain (Optional)

1. Go to your service settings in Render
2. Click "Custom Domains"
3. Add your domain and configure DNS

## SSL Certificate

Render automatically provides SSL certificates for all web services.

## Scaling

- **Free tier**: 750 hours/month, sleeps after 15 minutes of inactivity
- **Paid tiers**: Always-on, custom domains, more resources

## Monitoring

Monitor your application using:
- Render's built-in metrics
- Application logs
- Health check endpoint
