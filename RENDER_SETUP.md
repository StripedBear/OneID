# Render Backend Setup

## Environment Variables for Render

Add these environment variables in your Render dashboard:

### Required Variables:
```
DATABASE_URL=postgresql://username:password@host:port/database
SECRET_KEY=your-secret-key-here
CORS_ORIGINS=["http://localhost:3000","https://oneid-frontend.vercel.app"]
PROJECT_NAME=OneID API
API_V1_PREFIX=/api/v1
```

### Optional Variables:
```
ACCESS_TOKEN_EXPIRE_MINUTES=10080
MAX_FILE_SIZE=5242880
ALLOWED_EXTENSIONS=jpg,jpeg,png,webp
DEBUG=false
```

## Steps to Configure:

1. Go to your Render dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Add the variables above
5. Redeploy the service

## Important Notes:

- Make sure `CORS_ORIGINS` includes your frontend URL
- Use a strong `SECRET_KEY` for production
- Set `DEBUG=false` for production
- The database URL should be your production PostgreSQL connection string
