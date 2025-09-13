# OneID - Living Address Book

A modern contact management system that allows users to create public profiles with their contact channels.

## 🚀 Live Demo

- **Frontend**: https://oneid-frontend.vercel.app
- **Backend API**: https://oneid-m4s5.onrender.com
- **API Documentation**: https://oneid-m4s5.onrender.com/docs

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TailwindCSS, TypeScript
- **Backend**: FastAPI, Python 3.11, SQLAlchemy, Alembic
- **Database**: PostgreSQL (Supabase)
- **Storage**: Supabase Storage
- **Deployment**: Vercel (Frontend), Render (Backend)

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Git

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your API URL

# Start development server
npm run dev
```

### Environment Variables

**Backend (.env)**:
```bash
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=your-secret-key
CORS_ORIGINS=["http://localhost:3000","https://your-frontend-domain.com"]
```

**Frontend (.env.local)**:
```bash
NEXT_PUBLIC_API_BASE_URL=https://oneid-m4s5.onrender.com/api/v1
NEXT_PUBLIC_FRONTEND_URL=https://oneid-frontend.vercel.app
```

##  New Features

### Avatar Upload System
- **Secure file uploads** with comprehensive validation
- **Image processing** with Pillow (resize, optimize, format conversion)
- **Security measures**:
  - File type validation (JPEG, PNG, WebP only)
  - File size limits (5MB max)
  - MIME type verification
  - Image dimension validation
  - Secure filename generation
- **Drag & drop support** with preview
- **Automatic image optimization** and resizing

### Security Features
- **python-magic** for accurate MIME type detection
- **Pillow** for safe image processing
- **File extension and content validation**
- **Temporary file handling** with cleanup
- **User authentication required** for uploads

##  File Structure
```
backend/
├── uploads/          # User uploaded files (auto-created)
│   └── avatars/     # Processed avatar images
├── app/
│   ├── core/
│   │   └── image_utils.py  # Image processing utilities
│   └── api/routes/
│       └── auth.py         # Avatar upload endpoint
```

## Production Deployment
```bash
# For production with external access
npm run dev -- -H 0.0.0.0 -p 3000
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

##  TODO
- [ ] Docker image
- [ ] CDN integration for image serving
- [ ] Image compression optimization
- [ ] Backup and recovery system
