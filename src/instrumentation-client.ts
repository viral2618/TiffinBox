import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://3ee2317708284e6998aad179a8071a0e@bugsink.zeeshanali.space/11',
  release: 'whenfresh@0.1.0',
  integrations: [],
  tracesSampleRate: 0,
  environment: process.env.NODE_ENV || 'development',
  beforeSend(event) {
    console.log('🐛 Bugsink Client: Capturing error event', event.exception?.values?.[0]?.value);
    
    // Add fingerprinting for better error grouping
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