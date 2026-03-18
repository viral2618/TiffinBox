import { RedisScheduler } from './notifications/redis-scheduler';

export function initializeRealtimeServices() {
  // Initialize Socket.IO server
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  fetch(`${baseUrl}/api/socket`).catch(console.error);
  
  // Start Redis scheduler only if enabled
  if (process.env.DISABLE_REDIS !== 'true') {
    RedisScheduler.start();
  }
  
  console.log('Real-time services initialized');
}