import { initFrontendForm } from './frontend-form.js';

export function initSubscription() {
  initFrontendForm(document.querySelector('.footer-subscription'), {
    successMessage:
      'Your email has been checked and cleared. Subscriptions are not connected yet, so your email has not been sent.',
  });
}
