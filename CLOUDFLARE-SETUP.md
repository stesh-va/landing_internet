# Cloudflare — если не получается wrangler login

Есть **два способа** без `wrangler login`. Способ A (через сайт) — самый простой.

---

## Способ A. Всё через сайт Cloudflare (без терминала)

### 1. Регистрация

1. Откройте https://dash.cloudflare.com/sign-up  
   Если не открывается — попробуйте с VPN.
2. Зарегистрируйтесь (email + пароль, бесплатно).

### 2. Создайте Worker

1. В меню слева: **Workers & Pages**
2. **Create** → **Create Worker**
3. Имя: `internet-leads-worker` → **Deploy**
4. После деплоя нажмите **Edit code**

### 3. Вставьте код

Удалите всё в редакторе и вставьте содержимое файла  
`worker/src/index.js` из этого проекта.

Нажмите **Save and deploy**.

### 4. Добавьте секреты

1. **Settings** (вкладка Worker) → **Variables and Secrets**
2. **Add** → тип **Secret**:
   - Name: `BOT_TOKEN` → Value: токен от @BotFather
3. **Add** → тип **Secret**:
   - Name: `CHAT_ID` → Value: ваш chat id (только цифры)
4. **Add** → тип **Text** (не Secret):
   - Name: `ALLOWED_ORIGINS`
   - Value: `https://stesh-va.github.io`

**Save and deploy** ещё раз.

### 5. Скопируйте URL Worker

На главной странице Worker будет адрес вида:

```
https://internet-leads-worker.ВАШ_АККАУНТ.workers.dev
```

### 6. Пропишите URL в лендинге

Файл `js/config.js`:

```javascript
WORKER_URL: 'https://internet-leads-worker.ВАШ_АККАУНТ.workers.dev',
```

Закоммитьте и запушьте на GitHub.

---

## Способ B. API-токен (если хотите через терминал)

Без `wrangler login`, через токен.

### 1. Создайте токен

1. https://dash.cloudflare.com/profile/api-tokens
2. **Create Token**
3. Шаблон **Edit Cloudflare Workers** → Continue → Create Token
4. Скопируйте токен (показывается один раз).

### 2. Деплой в PowerShell

```powershell
cd D:\my_projects\it\home_internet\worker

$env:CLOUDFLARE_API_TOKEN="вставьте_токен_сюда"

npx wrangler secret put BOT_TOKEN
npx wrangler secret put CHAT_ID

npm run deploy
```

Дальше — как в TELEGRAM-SETUP.md: URL в `js/config.js` и push.

---

## Частые проблемы с wrangler login

| Симптом | Решение |
|---------|---------|
| Браузер не открывается | Способ A через сайт |
| Страница Cloudflare не грузится | VPN или Способ A |
| `Authentication error` после входа | Способ B с API-токеном |
| Зависает на `Waiting for authorization` | Закройте, используйте Способ A или B |
| Ошибка SSL / certificate | Обновите Windows, попробуйте другой браузер |

---

## Проверка Worker

После деплоя откройте в браузере URL Worker — может быть пустая страница или `Method not allowed` — **это нормально** (Worker принимает только POST).

Проверка через форму на сайте:
https://stesh-va.github.io/landing_internet/

---

## Напишите, если снова не получится

Пришлите **текст ошибки** или скрин (без токенов). Не присылайте BOT_TOKEN и API Token.
