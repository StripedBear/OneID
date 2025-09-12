# HumanDNS - Living Address Book

 **Backend (FastAPI)**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies including new image processing libraries
pip install -r requirements.txt

# Start server
uvicorn app.main:app --reload
```

 Server will start on http://localhost:8000

 **Frontend (Next.js + TailwindCSS)**
```bash
cd frontend
npm install
npm run dev
```

 Client will be available on http://localhost:3000

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
