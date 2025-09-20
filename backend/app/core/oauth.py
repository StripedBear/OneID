from authlib.integrations.fastapi_oauth2 import GoogleOAuth2, GitHubOAuth2, DiscordOAuth2
from app.core.config import settings

# Google OAuth2
google_oauth = GoogleOAuth2(
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    scope="openid email profile"
)

# GitHub OAuth2
github_oauth = GitHubOAuth2(
    client_id=settings.GITHUB_CLIENT_ID,
    client_secret=settings.GITHUB_CLIENT_SECRET,
    scope="user:email"
)

# Discord OAuth2
discord_oauth = DiscordOAuth2(
    client_id=settings.DISCORD_CLIENT_ID,
    client_secret=settings.DISCORD_CLIENT_SECRET,
    scope="identify email"
)

# OAuth провайдеры
OAUTH_PROVIDERS = {
    "google": google_oauth,
    "github": github_oauth,
    "discord": discord_oauth
}

