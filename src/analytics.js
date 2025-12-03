import * as amplitude from '@amplitude/analytics-browser';
import { autocapturePlugin } from '@amplitude/plugin-autocapture-browser';

let _initialized = false;

export function initAmplitude(apiKey, userId = null, options = {}) {
  if (!apiKey) {
    return;
  }

  if (_initialized) {
    return;
  }

  amplitude.add((instance) => autocapturePlugin(instance));

  amplitude.init(apiKey, userId, {
    autocapture: {
      pageViews: false,
      elementInteractions: false,
      webVitals: true,
    },
    trackPageViewOnHistoryChange: false,
    ...options,
  });

  _initialized = true;
  console.info('[Analytics] Amplitude inicializado');
}


export function identifyUser(userId, userProperties = {}) {
  if (!userId) return;
  amplitude.setUserId(userId);
  if (Object.keys(userProperties).length) {
    amplitude.identify({
      user_properties: userProperties,
    });
  }
}

export function trackEvent(eventType, eventProperties = {}) {
  try {
    amplitude.track(eventType, eventProperties);
  } catch (err) {
    console.warn('[Analytics] trackEvent falhou', err);
  }
}