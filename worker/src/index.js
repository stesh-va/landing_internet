/**
 * Cloudflare Worker — принимает заявки с лендинга и отправляет в Telegram.
 *
 * Секреты (Settings → Variables):
 *   BOT_TOKEN  — токен от @BotFather
 *   CHAT_ID    — ваш Telegram chat ID
 *
 * Опционально:
 *   ALLOWED_ORIGINS — через запятую, например:
 *     https://username.github.io,https://yourdomain.ru
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function corsResponse(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = (env.ALLOWED_ORIGINS || '*').split(',').map((s) => s.trim());
  const allowOrigin =
    allowed.includes('*') || allowed.includes(origin) ? origin || '*' : allowed[0] || '*';

  return {
    ...CORS_HEADERS,
    'Access-Control-Allow-Origin': allowOrigin,
  };
}

function json(data, status, cors) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}

function normalizePhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
    const d = digits.startsWith('8') ? '7' + digits.slice(1) : digits;
    return `+7 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}`;
  }
  return null;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildTelegramMessage(payload) {
  const lines = [
    '🔔 <b>Новая заявка с лендинга</b>',
    '',
    `📞 <b>Телефон:</b> ${escapeHtml(payload.phone)}`,
    `🕐 <b>Время:</b> ${escapeHtml(payload.timestamp)}`,
  ];

  const utmParts = [
    payload.utm_source && `source: ${payload.utm_source}`,
    payload.utm_medium && `medium: ${payload.utm_medium}`,
    payload.utm_campaign && `campaign: ${payload.utm_campaign}`,
  ].filter(Boolean);

  if (utmParts.length) {
    lines.push(`📊 <b>UTM:</b> ${escapeHtml(utmParts.join(', '))}`);
  }

  if (payload.page_url) {
    lines.push(`🔗 <b>Страница:</b> ${escapeHtml(payload.page_url)}`);
  }

  return lines.join('\n');
}

async function sendTelegram(token, chatId, text) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    }),
  });

  const data = await response.json();
  if (!data.ok) {
    throw new Error(data.description || 'Telegram API error');
  }
  return data;
}

export default {
  async fetch(request, env) {
    const cors = corsResponse(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, cors);
    }

    if (!env.BOT_TOKEN || !env.CHAT_ID) {
      return json({ error: 'Server not configured' }, 500, cors);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON' }, 400, cors);
    }

    const phone = normalizePhone(body.phone);
    if (!phone) {
      return json({ error: 'Invalid phone number' }, 400, cors);
    }

    const payload = {
      phone,
      timestamp: new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }),
      utm_source: body.utm_source || '',
      utm_medium: body.utm_medium || '',
      utm_campaign: body.utm_campaign || '',
      page_url: body.page_url || '',
    };

    try {
      await sendTelegram(env.BOT_TOKEN, env.CHAT_ID, buildTelegramMessage(payload));
      return json({ ok: true }, 200, cors);
    } catch (err) {
      console.error('Telegram error:', err.message);
      return json({ error: 'Failed to send notification' }, 502, cors);
    }
  },
};
