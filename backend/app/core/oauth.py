from authlib.integrations.starlette_client import OAuth
from app.core.config import settings

# Создаем OAuth клиент
oauth = OAuth()

# Google OAuth2
oauth.register(
    name='google',
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid_configuration",
    client_kwargs={"scope": "openid email profile"}
)

# GitHub OAuth2
print(f"GitHub Client ID: {settings.GITHUB_CLIENT_ID}")
print(f"GitHub Client Secret: {'*' * len(settings.GITHUB_CLIENT_SECRET) if settings.GITHUB_CLIENT_SECRET else 'NOT SET'}")

oauth.register(
    name='github',
    client_id=settings.GITHUB_CLIENT_ID,
    client_secret=settings.GITHUB_CLIENT_SECRET,
    authorize_url="https://github.com/login/oauth/authorize",
    token_url="https://github.com/login/oauth/access_token",
    scope="user:email"
)

# Discord OAuth2
oauth.register(
    name='discord',
    client_id=settings.DISCORD_CLIENT_ID,
    client_secret=settings.DISCORD_CLIENT_SECRET,
    authorize_url="https://discord.com/api/oauth2/authorize",
    token_url="https://discord.com/api/oauth2/token",
    scope="identify email"
)

# OAuth провайдеры
OAUTH_PROVIDERS = {
    "google": oauth.google,
    "github": oauth.github,
    "discord": oauth.discord
}

