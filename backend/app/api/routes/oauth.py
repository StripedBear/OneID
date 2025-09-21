from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.db.deps import get_db
from app.crud import user as crud_user
from app.schemas.auth import OAuthUserInfo, TokenResponse
from app.core.security import create_access_token
from app.core.oauth import OAUTH_PROVIDERS
import httpx
import json

router = APIRouter(prefix="/oauth", tags=["oauth"])


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
    from app.core.oauth import github_oauth
    
    # Get redirect_uri from query params or use default
    redirect_uri = request.query_params.get("redirect_uri", "http://localhost:3000/auth/callback/github")
    
    # Generate authorization URL
    auth_url = github_oauth.create_authorization_url(
        github_oauth.authorize_url,
        redirect_uri=redirect_uri
    )
    
    return RedirectResponse(url=auth_url[0])


@router.get("/discord")
async def discord_login(request: Request):
    """Initiate Discord OAuth login."""
    from app.core.oauth import discord_oauth
    
    # Get redirect_uri from query params or use default
    redirect_uri = request.query_params.get("redirect_uri", "http://localhost:3000/auth/callback/discord")
    
    # Generate authorization URL
    auth_url = discord_oauth.create_authorization_url(
        discord_oauth.authorize_url,
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
    access_token = create_access_token(subject=user.id)
    
    return TokenResponse(access_token=access_token, token_type="bearer")


@router.get("/github/callback", response_model=TokenResponse)
async def github_callback(request: Request, db: Session = Depends(get_db)):
    """Handle GitHub OAuth callback."""
    from app.core.oauth import github_oauth
    
    # Get authorization code from query params
    code = request.query_params.get("code")
    state = request.query_params.get("state")
    
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code not provided")
    
    # Exchange code for token
    token = await github_oauth.fetch_token(
        github_oauth.token_url,
        code=code,
        redirect_uri=request.url_for("github_callback")
    )
    
    user_info = await get_github_user_info(token["access_token"])
    
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
    access_token = create_access_token(subject=user.id)
    
    return TokenResponse(access_token=access_token, token_type="bearer")


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
    token = await discord_oauth.fetch_token(
        discord_oauth.token_url,
        code=code,
        redirect_uri=request.url_for("discord_callback")
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
    access_token = create_access_token(subject=user.id)
    
    return TokenResponse(access_token=access_token, token_type="bearer")
