export function initSignUp() {
  const form = document.querySelector('.sign-up-form');
  if (!form) return;

  const fields = [...form.querySelectorAll('input, textarea')];
  const status = form.querySelector('[role="status"]');
  const submit = form.querySelector('[type="submit"]');
  const touched = new Set();

  function errorMessage(field) {
    if (!field.value.trim()) {
      const messages = {
        name: 'Please enter your name.',
        email: 'Please enter your email address.',
        message: 'Please enter your message.',
      };
      return messages[field.name];
    }

    if (field.type === 'email' && field.validity.typeMismatch) {
      return 'Please enter a valid email address.';
    }

    if (field.maxLength > 0 && field.value.length > field.maxLength) {
      return `Please use no more than ${field.maxLength} characters.`;
    }

    return '';
  }

  function validate(field) {
    const error = document.getElementById(`${field.id}-error`);
    const message = errorMessage(field);
    error.textContent = message;
    error.hidden = !message;

    if (message) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');

    return !message;
  }

  fields.forEach(field => {
    field.addEventListener('blur', () => {
      touched.add(field);
      validate(field);
    });

    field.addEventListener('input', () => {
      status.textContent = '';
      if (touched.has(field)) validate(field);
    });
  });

  form.addEventListener('submit', event => {
    event.preventDefault();

    const invalid = fields.filter(field => {
      touched.add(field);
      return !validate(field);
    });

    if (invalid.length) {
      status.textContent = 'Please check the highlighted fields.';
      invalid[0].focus();
      return;
    }

    // Frontend-only stage: no network request or data storage.
    form.reset();
    touched.clear();
    fields.forEach(field => {
      field.removeAttribute('aria-invalid');
      const error = document.getElementById(`${field.id}-error`);
      error.textContent = '';
      error.hidden = true;
    });

    status.textContent =
      'Your form has been checked and cleared. Sending is not connected yet, so your details have not been sent.';
    status.focus();
  });

  form.noValidate = true;
  submit.disabled = false;
}
