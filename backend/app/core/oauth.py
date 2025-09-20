from authlib.integrations.fastapi_client import OAuth2
from app.core.config import settings

# Google OAuth2
google_oauth = OAuth2(
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid_configuration",
    client_kwargs={"scope": "openid email profile"}
)

# GitHub OAuth2
github_oauth = OAuth2(
    client_id=settings.GITHUB_CLIENT_ID,
    client_secret=settings.GITHUB_CLIENT_SECRET,
    authorize_url="https://github.com/login/oauth/authorize",
    token_url="https://github.com/login/oauth/access_token",
    client_kwargs={"scope": "user:email"}
)

# Discord OAuth2
discord_oauth = OAuth2(
    client_id=settings.DISCORD_CLIENT_ID,
    client_secret=settings.DISCORD_CLIENT_SECRET,
    authorize_url="https://discord.com/api/oauth2/authorize",
    token_url="https://discord.com/api/oauth2/token",
    client_kwargs={"scope": "identify email"}
)

# OAuth провайдеры
OAUTH_PROVIDERS = {
    "google": google_oauth,
    "github": github_oauth,
    "discord": discord_oauth
}

