import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://3ee2317708284e6998aad179a8071a0e@bugsink.zeeshanali.space/11',
  release: 'whenfresh@0.1.0',
  integrations: [],
  tracesSampleRate: 0,
  environment: process.env.NODE_ENV || 'development',
});