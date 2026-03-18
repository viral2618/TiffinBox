export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('🐛 Instrumentation: Initializing Sentry on server');
    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    console.log('🐛 Instrumentation: Initializing Sentry on edge runtime');
    await import('../sentry.edge.config');
  }
}

export async function onRequestError(err: unknown, request: any, context: any) {
  console.log('🐛 Instrumentation: Request error captured', err);
  const { captureRequestError } = await import('@sentry/nextjs');
  captureRequestError(err, request, context);
}