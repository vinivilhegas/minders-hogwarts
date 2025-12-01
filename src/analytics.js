import * as amplitude from '@amplitude/analytics-browser';
import { autocapturePlugin } from '@amplitude/plugin-autocapture-browser';

let _initialized = false;

/**
 * Inicializa Amplitude + plugin autocapture.
 * - apiKey: string - sua chave pública do Amplitude (não comitar)
 * - userId: string|null - opcional, setar quando usuário fizer login
 * - options: object - opções adicionais (opcional)
 */
export function initAmplitude(apiKey, userId = null, options = {}) {
  console.log('[DEBUG analytics] initAmplitude called, apiKey length=', apiKey ? apiKey.length : 0);
  if (!apiKey) {
    console.warn('[Analytics] AMPLITUDE_API_KEY não fornecida — analytics desabilitado.');
    return;
  }

  if (_initialized) {
    // evita init duplicado
    return;
  }

  // registra plugin (ele recebe a instância quando adicionamos)
  amplitude.add((instance) => autocapturePlugin(instance));

  // inicializa
  amplitude.init(apiKey, userId, {
    // ativar capture de pageViews e elementos relevantes para SPA
    autocapture: {
      pageViews: false,
      elementInteractions: false,
      webVitals: true,
      // você pode habilitar fileDownloads, formInteractions, etc conforme necessidade
    },
    // força o SDK a rastrear mudanças de history (útil em SPA)
    trackPageViewOnHistoryChange: false,
    ...options,
  });

  _initialized = true;
  console.info('[Analytics] Amplitude inicializado');
}

/**
 * Define userId e user_properties (usar ao logar)
 */
export function identifyUser(userId, userProperties = {}) {
  if (!userId) return;
  amplitude.setUserId(userId);
  if (Object.keys(userProperties).length) {
    amplitude.identify({
      user_properties: userProperties,
    });
  }
}

/**
 * Track event genérico
 */
export function trackEvent(eventType, eventProperties = {}) {
  try {
    amplitude.track(eventType, eventProperties);
  } catch (err) {
    console.warn('[Analytics] trackEvent falhou', err);
  }
}

/**
 * Track de Page View manual (opcional)
 */
/*export function trackPageView(name, props = {}) {
  trackEvent('Page Viewed', { page_title: name, ...props });
}*/