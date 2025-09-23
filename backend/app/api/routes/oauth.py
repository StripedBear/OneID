from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.db.deps import get_db
from app.crud import user as crud_user
from app.crud import channel as crud_channel
from app.crud import group as crud_group
from app.schemas.auth import OAuthUserInfo, TokenResponse
from app.core.security import create_access_token
from app.core.config import settings
import httpx
import json
import secrets

router = APIRouter(prefix="/oauth", tags=["oauth"])


def create_oauth_channels(db: Session, user, provider: str, user_info: dict):
    """Create channels automatically based on OAuth provider and user info."""
    try:
        # Get or create "OAuth" group
        oauth_group = crud_group.get_group_by_name(db, "OAuth", user.id)
        if not oauth_group:
            from app.schemas.group import GroupCreate
            oauth_group = crud_group.create_group(db, GroupCreate(name="OAuth", description="Channels added via OAuth login"), user.id)
        
        # Create channels based on provider
        if provider == "github":
            # Add GitHub profile URL
            if user_info.get("login"):
                github_url = f"https://github.com/{user_info['login']}"
                # Check if channel already exists
                existing_channels = crud_channel.list_for_user(db, user.id)
                if not any(ch.type == "github" and ch.value == github_url for ch in existing_channels):
                    crud_channel.create(
                        db, user=user,
                        type="github",
                        value=github_url,
                        label="GitHub Profile",
                        is_public=True,
                        is_primary=False,
                        sort_order=0,
                        group_id=oauth_group.id
                    )
        
        elif provider == "google":
            # Add Google profile (if available)
            if user_info.get("email"):
                # Check if channel already exists
                existing_channels = crud_channel.list_for_user(db, user.id)
                if not any(ch.type == "email" and ch.value == user_info["email"] and ch.label == "Google Email" for ch in existing_channels):
                    crud_channel.create(
                        db, user=user,
                        type="email",
                        value=user_info["email"],
                        label="Google Email",
                        is_public=True,
                        is_primary=True,
                        sort_order=0,
                        group_id=oauth_group.id
                    )
        
        elif provider == "discord":
            # Add Discord username
            if user_info.get("username"):
                discord_handle = f"@{user_info['username']}"
                # Check if channel already exists
                existing_channels = crud_channel.list_for_user(db, user.id)
                if not any(ch.type == "custom" and ch.value == discord_handle and ch.label == "Discord" for ch in existing_channels):
                    crud_channel.create(
                        db, user=user,
                        type="custom",
                        value=discord_handle,
                        label="Discord",
                        is_public=True,
                        is_primary=False,
                        sort_order=0,
                        group_id=oauth_group.id
                    )
        
        elif provider == "telegram":
            # Add Telegram username
            if user_info.get("username"):
                telegram_handle = f"@{user_info['username']}"
                # Check if channel already exists
                existing_channels = crud_channel.list_for_user(db, user.id)
                if not any(ch.type == "telegram" and ch.value == telegram_handle for ch in existing_channels):
                    crud_channel.create(
                        db, user=user,
                        type="telegram",
                        value=telegram_handle,
                        label="Telegram",
                        is_public=True,
                        is_primary=False,
                        sort_order=0,
                        group_id=oauth_group.id
                    )
    
    except Exception as e:
        # Don't fail OAuth login if channel creation fails
        print(f"Failed to create OAuth channels: {e}")


async def get_google_user_info(access_token: str) -> dict:
    """Get user info from Google."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get Google user info")
        return response.json()


async def get_github_user_info(access_token: str) -> dict:
    """Get user info from GitHub."""
    async with httpx.AsyncClient() as client:
        # Get user info
        user_response = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        if user_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get GitHub user info")
        
        user_data = user_response.json()
        
        # Get email (might be private)
        email_response = await client.get(
            "https://api.github.com/user/emails",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        emails = email_response.json() if email_response.status_code == 200 else []
        primary_email = next((email["email"] for email in emails if email["primary"]), user_data.get("email"))
        
        return {
            "id": str(user_data["id"]),
            "email": primary_email,
            "name": user_data.get("name", ""),
            "login": user_data.get("login", ""),
            "avatar_url": user_data.get("avatar_url")
        }


async def get_discord_user_info(access_token: str) -> dict:
    """Get user info from Discord."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://discord.com/api/users/@me",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get Discord user info")
        return response.json()


async def get_telegram_user_info(access_token: str) -> dict:
    """Get user info from Telegram."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.telegram.org/bot/getMe",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get Telegram user info")
        return response.json()


@router.get("/google")
async def google_login(request: Request):
    """Initiate Google OAuth login."""
    from app.core.oauth import oauth
    
    # Get redirect_uri from query params or use default
    redirect_uri = request.query_params.get("redirect_uri", "http://localhost:3000/auth/callback/google")
    
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/github")
async def github_login(request: Request):
    """Initiate GitHub OAuth login."""
    # Generate state for CSRF protection
    state = secrets.token_urlsafe(32)
    
    # Get redirect_uri from query params or use default
    redirect_uri = request.query_params.get("redirect_uri", "http://localhost:3000/auth/callback/github")
    
    # Build GitHub authorization URL
    auth_url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={settings.GITHUB_CLIENT_ID}"
        f"&redirect_uri={redirect_uri}"
        f"&scope=user:email"
        f"&state={state}"
    )
    
    return RedirectResponse(url=auth_url)


@router.get("/discord")
async def discord_login(request: Request):
    """Initiate Discord OAuth login."""
    from app.core.oauth import discord_oauth
    
    # Get redirect_uri from query params or use default
    redirect_uri = request.query_params.get("redirect_uri", "http://localhost:3000/auth/callback/discord")
    
    # Generate authorization URL
    auth_url = discord_oauth.create_authorization_url(
        "https://discord.com/api/oauth2/authorize",
        redirect_uri=redirect_uri
    )
    
    return RedirectResponse(url=auth_url[0])


@router.get("/google/callback", response_model=TokenResponse)
async def google_callback(request: Request, db: Session = Depends(get_db)):
    """Handle Google OAuth callback."""
    from app.core.oauth import oauth
    
    token = await oauth.google.authorize_access_token(request)
    user_info = await get_google_user_info(token["access_token"])
    
    # Create OAuth user data
    oauth_data = OAuthUserInfo(
        provider="google",
        provider_id=user_info["id"],
        email=user_info["email"],
        username=user_info.get("name", user_info["email"].split("@")[0]),
        first_name=user_info.get("given_name"),
        last_name=user_info.get("family_name"),
        avatar_url=user_info.get("picture"),
        display_name=user_info.get("name")
    )
    
    # Create or get user
    user = crud_user.create_oauth_user(db, oauth_data)
    
    # Create OAuth channels automatically
    create_oauth_channels(db, user, "google", user_info)
    
    access_token = create_access_token(subject=user.id)
    
    return TokenResponse(access_token=access_token, token_type="bearer")


@router.get("/github/callback")
async def github_callback(request: Request, db: Session = Depends(get_db)):
    """Handle GitHub OAuth callback."""
    # Get authorization code from query params
    code = request.query_params.get("code")
    state = request.query_params.get("state")
    
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code not provided")
    
    # Exchange code for token using simple HTTP request
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://github.com/login/oauth/access_token",
            data={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": str(request.url_for("github_callback"))
            },
            headers={"Accept": "application/json"}
        )
        
        if token_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to exchange code for token")
        
        token_data = token_response.json()
        access_token = token_data.get("access_token")
        
        if not access_token:
            raise HTTPException(status_code=400, detail="No access token received")
    
    # Get user info from GitHub
    user_info = await get_github_user_info(access_token)
    
    # Create OAuth user data
    oauth_data = OAuthUserInfo(
        provider="github",
        provider_id=user_info["id"],
        email=user_info["email"],
        username=user_info["login"],
        first_name=user_info.get("name", "").split(" ")[0] if user_info.get("name") else None,
        last_name=" ".join(user_info.get("name", "").split(" ")[1:]) if user_info.get("name") and len(user_info.get("name", "").split(" ")) > 1 else None,
        avatar_url=user_info.get("avatar_url"),
        display_name=user_info.get("name")
    )
    
    # Create or get user
    user = crud_user.create_oauth_user(db, oauth_data)
    
    # Create OAuth channels automatically
    create_oauth_channels(db, user, "github", user_info)
    
    access_token = create_access_token(subject=user.id)
    
    # Redirect to frontend with token
    redirect_url = f"{settings.FRONTEND_URL}/auth/callback/github?token={access_token}"
    return RedirectResponse(url=redirect_url)


@router.get("/discord/callback", response_model=TokenResponse)
async def discord_callback(request: Request, db: Session = Depends(get_db)):
    """Handle Discord OAuth callback."""
    from app.core.oauth import discord_oauth
    
    # Get authorization code from query params
    code = request.query_params.get("code")
    state = request.query_params.get("state")
    
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code not provided")
    
    # Exchange code for token
    token = discord_oauth.fetch_token(
        "https://discord.com/api/oauth2/token",
        code=code,
        redirect_uri=str(request.url_for("discord_callback"))
    )
    
    user_info = await get_discord_user_info(token["access_token"])
    
    # Create OAuth user data
    oauth_data = OAuthUserInfo(
        provider="discord",
        provider_id=user_info["id"],
        email=user_info["email"],
        username=user_info["username"],
        first_name=user_info.get("global_name", user_info["username"]),
        avatar_url=f"https://cdn.discordapp.com/avatars/{user_info['id']}/{user_info['avatar']}.png" if user_info.get("avatar") else None,
        display_name=user_info.get("global_name", user_info["username"])
    )
    
    # Create or get user
    user = crud_user.create_oauth_user(db, oauth_data)
    
    # Create OAuth channels automatically
    create_oauth_channels(db, user, "discord", user_info)
    
    access_token = create_access_token(subject=user.id)
    
    return TokenResponse(access_token=access_token, token_type="bearer")
