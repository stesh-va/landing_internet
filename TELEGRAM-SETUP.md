# Подключение формы к Telegram

Сайт: https://stesh-va.github.io/landing_internet/

После выполнения всех шагов заявки с формы будут приходить вам в Telegram.

---

## Шаг 1. Узнайте Chat ID

1. Откройте Telegram и напишите **своему боту** команду `/start`
2. Откройте в браузере (подставьте токен бота вместо `ВАШ_ТОКЕН`):

```
https://api.telegram.org/botВАШ_ТОКЕН/getUpdates
```

3. В ответе найдите строку вида:

```json
"chat":{"id":123456789
```

Число `123456789` — это ваш **CHAT_ID**. Сохраните его.

> Если ответ `{"ok":true,"result":[]}` — сначала напишите боту `/start` и обновите страницу в браузере.

---

## Шаг 2. Войдите в Cloudflare

В терминале (PowerShell):

```powershell
cd D:\my_projects\it\home_internet\worker
npx wrangler login
```

Откроется браузер — войдите в Cloudflare (регистрация бесплатная) и разрешите доступ.

---

## Шаг 3. Добавьте секреты бота

```powershell
npx wrangler secret put BOT_TOKEN
```
Вставьте токен от @BotFather и нажмите Enter.

```powershell
npx wrangler secret put CHAT_ID
```
Вставьте ваш chat id (только цифры) и нажмите Enter.

---

## Шаг 4. Задеплойте Worker

```powershell
npm run deploy
```

В конце увидите URL вида:

```
https://internet-leads-worker.ВАШ_АККАУНТ.workers.dev
```

**Скопируйте этот URL.**

---

## Шаг 5. Пропишите URL на лендинге

Откройте файл `js/config.js` и вставьте URL:

```javascript
const CONFIG = {
  WORKER_URL: 'https://internet-leads-worker.ВАШ_АККАУНТ.workers.dev',
  WORK_HOURS: '9:00–21:00',
};
```

Сохраните, закоммитьте и запушьте:

```powershell
cd D:\my_projects\it\home_internet
git add js/config.js worker/wrangler.toml
git commit -m "Connect form to Telegram worker"
git push
```

Подождите 1–2 минуты, пока GitHub Pages обновится.

---

## Шаг 6. Проверка

1. Откройте https://stesh-va.github.io/landing_internet/
2. Введите **свой** номер телефона
3. Нажмите «Перезвоните мне»
4. В Telegram должно прийти сообщение с номером

---

## Если не работает

| Симптом | Что проверить |
|---------|----------------|
| «Сервис временно недоступен» | `WORKER_URL` пустой в `config.js` или не запушен на GitHub |
| Ошибка сети / CORS | В `worker/wrangler.toml` должно быть `ALLOWED_ORIGINS = "https://stesh-va.github.io"` |
| «Failed to send notification» | Неверный BOT_TOKEN или CHAT_ID; напишите боту `/start` |
| Форма отправилась, сообщения нет | Проверьте CHAT_ID через getUpdates ещё раз |

---

## Безопасность

- **Не публикуйте** токен бота в GitHub, чатах и скриншотах
- Токен хранится только в секретах Cloudflare (`wrangler secret put`)
