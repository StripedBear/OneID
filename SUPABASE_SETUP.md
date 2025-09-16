# Supabase Setup for OneID (Database + Storage)

## 1. Creating a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for initialization to complete

## 2. Database Configuration

### Getting Database URL:
1. Go to **Settings** → **Database**
2. Copy the **Connection string** (URI)
3. Replace `[YOUR-PASSWORD]` with your database password

Example URL:
```
postgresql+psycopg://postgres:[password]@db.abcdefghijklmnop.supabase.co:5432/postgres
```

## 3. Storage Configuration

1. In Supabase dashboard, go to **Storage**
2. Create a new bucket named `avatars`
3. Configure access policies:

### Upload Policy (INSERT):
```sql
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Read Policy (SELECT):
```sql
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');
```

### Delete Policy (DELETE):
```sql
CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## 4. Getting API Keys

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (SUPABASE_URL)
   - **anon public** key (SUPABASE_KEY)

## 5. Environment Variables Setup

Add to your `.env` file:

```env
# Database Configuration (Supabase PostgreSQL)
DATABASE_URL=postgresql+psycopg://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_BUCKET=avatars
```

## 6. Installing Dependencies

```bash
cd backend
pip install supabase==2.3.4
```

## 7. Running Migrations

```bash
# Run migrations to create tables in Supabase
alembic upgrade head
```

## 8. Restarting the Application

After setting up environment variables, restart the backend:

```bash
# If using Docker
docker-compose restart backend

# If running locally
uvicorn app.main:app --reload
```

## Benefits of Using Supabase

### Database:
- **PostgreSQL** - powerful relational database
- **Automatic backups** - daily snapshots
- **Scalability** - automatic scaling
- **Monitoring** - built-in metrics and logs
- **Security** - SSL connections and RLS

### Storage:
- **CDN** - fast image delivery
- **Scalability** - automatic scaling
- **Security** - built-in access policies
- **Backup** - automatic backups
- **Fallback** - local storage if Supabase is unavailable

### General:
- **Unified platform** - database and storage in one project
- **Easy management** - single interface for everything
- **Free tier** - up to 500MB database and 1GB storage

## File Structure in Supabase

```
avatars/
├── 1/
│   ├── avatar_1_abc123.jpg
│   └── avatar_1_def456.png
├── 2/
│   └── avatar_2_ghi789.webp
└── ...
```

Each user has their own folder with user ID.
