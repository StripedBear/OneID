# Настройка Supabase Storage для аватарок

## 1. Создание проекта в Supabase

1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Дождитесь завершения инициализации

## 2. Настройка Storage

1. В панели Supabase перейдите в **Storage**
2. Создайте новый bucket с именем `avatars`
3. Настройте политики доступа:

### Политика для загрузки (INSERT):
```sql
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Политика для чтения (SELECT):
```sql
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');
```

### Политика для удаления (DELETE):
```sql
CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## 3. Получение ключей

1. Перейдите в **Settings** → **API**
2. Скопируйте:
   - **Project URL** (SUPABASE_URL)
   - **anon public** ключ (SUPABASE_KEY)

## 4. Настройка переменных окружения

Добавьте в ваш `.env` файл:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_BUCKET=avatars
```

## 5. Установка зависимостей

```bash
cd backend
pip install supabase==2.3.4
```

## 6. Перезапуск приложения

После настройки переменных окружения перезапустите backend:

```bash
# Если используете Docker
docker-compose restart backend

# Если запускаете локально
uvicorn app.main:app --reload
```

## Преимущества Supabase Storage

- ✅ **CDN** - быстрая доставка изображений
- ✅ **Масштабируемость** - автоматическое масштабирование
- ✅ **Безопасность** - встроенные политики доступа
- ✅ **Резервное копирование** - автоматические бэкапы
- ✅ **Fallback** - если Supabase недоступен, используется локальное хранилище

## Структура файлов в Supabase

```
avatars/
├── 1/
│   ├── avatar_1_abc123.jpg
│   └── avatar_1_def456.png
├── 2/
│   └── avatar_2_ghi789.webp
└── ...
```

Каждый пользователь имеет свою папку с ID пользователя.
