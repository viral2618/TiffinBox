import * as Sentry from "@sentry/nextjs";

export function initBugsink() {
  try {
    console.log('🐛 Initializing Bugsink error tracking...');
    
    Sentry.init({
      dsn: "https://3ee2317708284e6998aad179a8071a0e@bugsink.zeeshanali.space/11",
      release: "whenfresh@0.1.0",
      integrations: [],
      tracesSampleRate: 0,
      environment: process.env.NODE_ENV || 'development',
      beforeSend(event) {
        console.log('🐛 Bugsink: Capturing error event', event.exception?.values?.[0]?.value);
        
        if (event.exception?.values?.[0]) {
          const error = event.exception.values[0];
          event.fingerprint = [
            error.type || 'Error',
            error.value?.split(':')[0] || 'unknown',
            event.transaction || 'unknown'
          ];
        }
        
        return event;
      },
    });
    
    console.log('✅ Bugsink initialized successfully');
  } catch (e) {
    console.warn('🐛 Bugsink: Failed to initialize, app continues without error tracking', e);
  }
}

export function captureException(error: Error, context?: Record<string, any>) {
  try {
    console.log('🐛 Bugsink: Manually capturing exception', error.message);
    Sentry.captureException(error, { 
      extra: context,
      fingerprint: [
        error.constructor.name,
        error.message.split(':')[0],
        'manual'
      ]
    });
  } catch (e) {
    console.warn('🐛 Bugsink: Failed to capture exception, app continues', e);
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  try {
    console.log(`🐛 Bugsink: Capturing message [${level}]`, message);
    Sentry.captureMessage(message, level);
  } catch (e) {
    console.warn('🐛 Bugsink: Failed to capture message, app continues', e);
  }
}