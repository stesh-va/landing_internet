# Лендинг «Бесплатный подбор интернета» — СПб и ЛО

Одностраничный лендинг для сбора заявок (телефон) с отправкой уведомлений в Telegram через Cloudflare Worker.

## Структура проекта

```
home_internet/
├── index.html          # Главная страница
├── privacy.html        # Политика конфиденциальности
├── css/style.css       # Стили (mobile-first)
├── js/
│   ├── config.js       # URL Worker'а (заполнить после деплоя)
│   └── main.js         # Форма, маска телефона, отправка
└── worker/             # Cloudflare Worker → Telegram
    ├── src/index.js
    ├── wrangler.toml
    └── package.json
```

---

## Часть 1. GitHub Pages (лендинг)

### 1. Создайте репозиторий на GitHub

Например: `home-internet-landing` (можно любое имя).

### 2. Загрузите код

```bash
cd D:\my_projects\it\home_internet
git init
git add .
git commit -m "Initial landing page"
git branch -M main
git remote add origin https://github.com/ВАШ_USERNAME/home-internet-landing.git
git push -u origin main
```

### 3. Включите GitHub Pages

1. GitHub → ваш репозиторий → **Settings** → **Pages**
2. **Source:** Deploy from a branch
3. **Branch:** `main` → папка `/ (root)` → **Save**

Через 1–2 минуты сайт будет доступен по адресу:

```
https://ВАШ_USERNAME.github.io/home-internet-landing/
```

Откройте с телефона и компьютера — проверьте форму и вёрстку.

---

## Часть 2. Cloudflare Worker (Telegram)

### Зачем это нужно (кратко)

GitHub Pages — это только «витрина» (HTML/CSS/JS). Он не может безопасно хранить токен Telegram-бота. Worker — маленький посредник на серверах Cloudflare: форма шлёт заявку ему, он пересылает вам в Telegram. Токен бота спрятан на сервере.

### 1. Регистрация Cloudflare

1. Зайдите на [cloudflare.com](https://cloudflare.com) → бесплатный аккаунт
2. Workers & Pages → Create → **Create Worker**

Или через CLI (удобнее):

```bash
cd worker
npm install
npx wrangler login
```

### 2. Узнайте свой Chat ID

1. Напишите своему боту в Telegram команду `/start`
2. Откройте в браузере (подставьте токен бота):

```
https://api.telegram.org/botВАШ_ТОКЕН/getUpdates
```

3. В ответе найдите `"chat":{"id":123456789}` — это ваш **CHAT_ID**

### 3. Задайте секреты

```bash
cd worker
npx wrangler secret put BOT_TOKEN
# вставьте токен от @BotFather

npx wrangler secret put CHAT_ID
# вставьте ваш chat id (число)
```

### 4. (Рекомендуется) Ограничьте CORS

В [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers → ваш worker → Settings → Variables:

| Variable | Value |
|----------|-------|
| `ALLOWED_ORIGINS` | `https://ВАШ_USERNAME.github.io` |

Или через `wrangler.toml`:

```toml
[vars]
ALLOWED_ORIGINS = "https://username.github.io"
```

### 5. Деплой Worker

```bash
cd worker
npm run deploy
```

После деплоя появится URL вида:

```
https://internet-leads-worker.ВАШ_АККАУНТ.workers.dev
```

Скопируйте его.

### 6. Пропишите URL в лендинге

Откройте `js/config.js`:

```javascript
const CONFIG = {
  WORKER_URL: 'https://internet-leads-worker.ВАШ_АККАУНТ.workers.dev',
  WORK_HOURS: '9:00–21:00',
};
```

Закоммитьте и запушьте — GitHub Pages обновится автоматически.

### 7. Проверка

1. Откройте лендинг на телефоне
2. Введите тестовый номер, отправьте форму
3. В Telegram должно прийти сообщение с номером и временем

---

## Часть 3. Реклама VK (когда будете готовы)

Добавьте UTM-метки в ссылку объявления:

```
https://ВАШ_USERNAME.github.io/home-internet-landing/?utm_source=vk&utm_medium=cpc&utm_campaign=podbor-internet-spb
```

UTM автоматически попадут в сообщение Telegram.

---

## Что обновить перед запуском рекламы

- [ ] `privacy.html` — заменить ФИО, ИНН, email на реальные
- [ ] `js/config.js` — URL Worker'а
- [ ] Протестировать форму с телефона
- [ ] Свой домен (опционально, позже)

---

## Локальный просмотр

Можно открыть `index.html` двойным кликом, но форма не отправится без Worker URL. Для полного теста используйте GitHub Pages или:

```bash
npx serve .
```
