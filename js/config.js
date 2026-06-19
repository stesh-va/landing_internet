/**
 * Конфигурация лендинга.
 * После деплоя Cloudflare Worker вставьте сюда URL worker'а.
 */
const CONFIG = {
  // URL вашего Cloudflare Worker (без слэша в конце)
  // Пример: 'https://internet-leads.your-name.workers.dev'
  WORKER_URL: 'https://internet-leads-worker.steshenko-va.workers.dev',

  // Рабочие часы (для сообщений на сайте)
  WORK_HOURS: '9:00–21:00',
};
