# OAuth Setup Guide

This guide explains how to set up OAuth authentication with Google, GitHub, and Discord for OneID.

## Overview

OAuth allows users to sign in using their existing social media accounts instead of creating new passwords. This improves user experience and reduces friction during registration.

## Supported Providers

- **Google** - Most popular, works with any Google account
- **GitHub** - Great for developers and tech-savvy users  
- **Discord** - Popular among gamers and online communities

## Backend Setup

### 1. Install Dependencies

The required dependencies are already added to `requirements.txt`:

```bash
pip install authlib==1.3.0
```

### 2. Database Migration

Run the migration to add OAuth fields to the users table:

```bash
cd backend
alembic upgrade head
```

### 3. Environment Variables

Add these OAuth credentials to your `.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth  
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Discord OAuth
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
```

## Provider Setup

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set Application type to "Web application"
6. Add authorized redirect URIs:
   - Development: `http://localhost:8000/api/v1/oauth/google/callback`
   - Production: `https://oneid-m4s5.onrender.com/api/v1/oauth/google/callback`
7. Copy Client ID and Client Secret to your `.env` file

### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the form:
   - Application name: "OneID"
   - Homepage URL: `https://one-id-mu.vercel.app`
   - Authorization callback URL: `https://oneid-m4s5.onrender.com/api/v1/oauth/github/callback`
4. Copy Client ID and Client Secret to your `.env` file

### Discord OAuth Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "OAuth2" section
4. Add redirect URI: `https://oneid-m4s5.onrender.com/api/v1/oauth/discord/callback`
5. Copy Client ID and Client Secret to your `.env` file

## Frontend Setup

### 1. Environment Variables

Add to your frontend `.env.local`:

```env
NEXT_PUBLIC_FRONTEND_URL=https://one-id-mu.vercel.app
NEXT_PUBLIC_API_BASE_URL=https://oneid-m4s5.onrender.com/api/v1
```

### 2. OAuth Flow

The OAuth flow works as follows:

1. User clicks "Continue with [Provider]" button
2. Frontend redirects to backend OAuth endpoint
3. Backend redirects to provider's OAuth page
4. User authorizes the application
5. Provider redirects back to backend callback
6. Backend exchanges code for user info
7. Backend creates/updates user and returns JWT token
8. Frontend receives token and logs user in

## API Endpoints

### OAuth Initiation
- `GET /api/v1/oauth/google` - Start Google OAuth
- `GET /api/v1/oauth/github` - Start GitHub OAuth  
- `GET /api/v1/oauth/discord` - Start Discord OAuth

### OAuth Callbacks
- `GET /api/v1/oauth/google/callback` - Handle Google callback
- `GET /api/v1/oauth/github/callback` - Handle GitHub callback
- `GET /api/v1/oauth/discord/callback` - Handle Discord callback

## User Model Changes

The User model now includes OAuth fields:

```python
class User(Base):
    # ... existing fields ...
    
    # OAuth providers
    google_id: Mapped[str | None] = mapped_column(String(100), unique=True, index=True, nullable=True)
    github_id: Mapped[str | None] = mapped_column(String(100), unique=True, index=True, nullable=True)
    discord_id: Mapped[str | None] = mapped_column(String(100), unique=True, index=True, nullable=True)
    
    # Password is now optional for OAuth users
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
```

## Security Considerations

1. **HTTPS Required**: OAuth only works over HTTPS in production
2. **State Parameter**: Consider implementing state parameter for CSRF protection
3. **Token Storage**: JWT tokens are stored in localStorage (consider httpOnly cookies for production)
4. **Scope Limitation**: Only request necessary OAuth scopes

## Testing

### Local Development

1. Set up OAuth apps with localhost URLs
2. Start backend: `cd backend && uvicorn app.main:app --reload`
3. Start frontend: `cd frontend && npm run dev`
4. Test OAuth flow on login/register pages

### Production Deployment

1. Update OAuth app settings with production URLs
2. Set environment variables in production
3. Run database migrations
4. Deploy both frontend and backend

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**: Check that callback URLs match exactly in OAuth app settings
2. **"Client ID not found"**: Verify environment variables are set correctly
3. **"Scope not authorized"**: Check that requested scopes are enabled in OAuth app
4. **Database errors**: Ensure migrations have been run

### Debug Mode

Enable debug logging in FastAPI to see OAuth flow details:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Next Steps

After OAuth is working:

1. Add more OAuth providers (Twitter, LinkedIn, etc.)
2. Implement account linking (connect multiple OAuth accounts)
3. Add OAuth profile picture sync
4. Implement OAuth account unlinking
5. Add OAuth-specific user settings

