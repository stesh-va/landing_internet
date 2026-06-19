(function () {
  'use strict';

  const PHONE_REGEX = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;

  function formatPhone(value) {
    const digits = value.replace(/\D/g, '');

    let normalized = digits;
    if (normalized.startsWith('8')) {
      normalized = '7' + normalized.slice(1);
    }
    if (!normalized.startsWith('7')) {
      normalized = '7' + normalized;
    }
    normalized = normalized.slice(0, 11);

    if (normalized.length <= 1) return '+7';
    if (normalized.length <= 4) return `+7 (${normalized.slice(1)}`;
    if (normalized.length <= 7) return `+7 (${normalized.slice(1, 4)}) ${normalized.slice(4)}`;
    if (normalized.length <= 9) return `+7 (${normalized.slice(1, 4)}) ${normalized.slice(4, 7)}-${normalized.slice(7)}`;
    return `+7 (${normalized.slice(1, 4)}) ${normalized.slice(4, 7)}-${normalized.slice(7, 9)}-${normalized.slice(9, 11)}`;
  }

  function getUtmParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_content: params.get('utm_content') || '',
      utm_term: params.get('utm_term') || '',
    };
  }

  function showError(form, message) {
    const errorEl = form.querySelector('.lead-form__error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = false;
    }
  }

  function clearError(form) {
    const errorEl = form.querySelector('.lead-form__error');
    const input = form.querySelector('.lead-form__input');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.hidden = true;
    }
    if (input) input.classList.remove('lead-form__input--error');
  }

  function setLoading(form, loading) {
    const btn = form.querySelector('.lead-form__btn');
    if (!btn) return;
    btn.disabled = loading;
    const label = btn.querySelector('span');
    if (label) {
      label.textContent = loading ? 'Отправка…' : btn.dataset.originalText || label.textContent;
    }
  }

  function showSuccess() {
    document.body.classList.add('is-success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function hideSuccess() {
    document.body.classList.remove('is-success');
  }

  async function submitLead(phone) {
    if (!CONFIG.WORKER_URL) {
      throw new Error('Сервис временно недоступен. Попробуйте позже или позвоните нам.');
    }

    const response = await fetch(CONFIG.WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone,
        ...getUtmParams(),
        page_url: window.location.href,
        referrer: document.referrer || '',
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || 'Не удалось отправить заявку. Попробуйте ещё раз.');
    }

    return data;
  }

  function initPhoneMask(input) {
    input.addEventListener('input', () => {
      const pos = input.selectionStart;
      const oldLen = input.value.length;
      input.value = formatPhone(input.value);
      const newLen = input.value.length;
      input.setSelectionRange(pos + (newLen - oldLen), pos + (newLen - oldLen));
      input.classList.remove('lead-form__input--error');
    });

    input.addEventListener('focus', () => {
      if (!input.value) input.value = '+7';
    });

    input.addEventListener('blur', () => {
      if (input.value === '+7') input.value = '';
    });
  }

  function initForm(form) {
    const phoneInput = form.querySelector('.lead-form__input');
    const consentCheckbox = form.querySelector('input[name="consent"]');
    const btn = form.querySelector('.lead-form__btn');

    if (btn) {
      const label = btn.querySelector('span');
      btn.dataset.originalText = label ? label.textContent.trim() : btn.textContent.trim();
    }

    if (phoneInput) initPhoneMask(phoneInput);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearError(form);

      const phone = phoneInput ? phoneInput.value.trim() : '';

      if (!PHONE_REGEX.test(phone)) {
        if (phoneInput) phoneInput.classList.add('lead-form__input--error');
        showError(form, 'Введите корректный номер телефона');
        phoneInput?.focus();
        return;
      }

      if (consentCheckbox && !consentCheckbox.checked) {
        showError(form, 'Необходимо согласие на обработку персональных данных');
        return;
      }

      setLoading(form, true);

      try {
        await submitLead(phone);
        form.reset();
        showSuccess();
      } catch (err) {
        showError(form, err.message || 'Произошла ошибка. Попробуйте ещё раз.');
      } finally {
        setLoading(form, false);
      }
    });
  }

  document.querySelectorAll('.lead-form').forEach(initForm);

  const successBack = document.getElementById('success-back');
  if (successBack) {
    successBack.addEventListener('click', hideSuccess);
  }
})();
