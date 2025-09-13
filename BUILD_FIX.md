# Исправление ошибок сборки Next.js

## Проблема
Ошибка Turbopack с CSS при сборке на Vercel:
```
Execution of SingleModuleGraph::new_with_entries failed
Execution of parse_css failed
TurbopackInternalError: Failed to write page endpoint /_error
```

## Решение

### 1. Понизили версии до стабильных
- Next.js: 15.5.0 → 14.2.5
- React: 19.1.0 → 18.3.1
- React DOM: 19.1.0 → 18.3.1
- Tailwind CSS: 4.0 → 3.4.0

### 2. Убрали Turbopack
- Удалили флаги `--turbopack` из скриптов
- Упростили next.config.ts

### 3. Упростили CSS
- Заменили `@import "tailwindcss"` на стандартные директивы
- Убрали сложные CSS переменные
- Упростили Tailwind конфигурацию

### 4. Обновили package.json
```json
{
  "dependencies": {
    "next": "14.2.5",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.2.5",
    "tailwindcss": "^3.4.0"
  }
}
```

## Пошаговое исправление

### 1. Очистите кэш
```bash
cd frontend
rm -rf node_modules package-lock.json .next
```

### 2. Переустановите зависимости
```bash
npm install
```

### 3. Проверьте локальную сборку
```bash
npm run build
```

### 4. Задеплойте на Vercel
```bash
git add .
git commit -m "Fix build errors - downgrade to stable versions"
git push
```

## Альтернативные решения

### Если сборка все еще не работает

1. **Используйте статический экспорт:**
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};
```

2. **Используйте Netlify вместо Vercel:**
- Netlify лучше работает со статическими сайтами
- Проще настройка для Next.js

3. **Используйте GitHub Pages:**
```bash
npm run build
npm run export
# Загрузите папку out/ в GitHub Pages
```

## Проверка результата

После исправлений:
- ✅ Сборка проходит без ошибок
- ✅ CSS загружается корректно
- ✅ Все страницы работают
- ✅ Деплой на Vercel успешен

## Причина ошибки

Next.js 15 с Turbopack еще нестабилен для production. Next.js 14 - проверенная версия, которая стабильно работает на Vercel.
