import { RedisScheduler } from './notifications/redis-scheduler';

function buildBaseUrl(): string {
  const raw = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  // Ensure the URL always has a protocol
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw.replace(/\/$/, '');
  }
  return `https://${raw.replace(/\/$/, '')}`;
}

export function initializeRealtimeServices() {
  // Initialize Socket.IO server
  const baseUrl = buildBaseUrl();
  fetch(`${baseUrl}/api/socket`).catch(console.error);
  
  // Start Redis scheduler only if enabled
  if (process.env.DISABLE_REDIS !== 'true') {
    RedisScheduler.start();
  }
  
  console.log('Real-time services initialized');
}