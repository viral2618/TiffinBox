import { RealtimeNotificationService } from '../notifications/realtime-service';

export class ReminderProcessor {
  private static intervalId: NodeJS.Timeout | null = null;

  static start() {
    if (process.env.DISABLE_CRON === 'true') {
      console.log('Cron jobs disabled in development');
      return;
    }
    
    if (this.intervalId) return;

    this.intervalId = setInterval(async () => {
      try {
        await RealtimeNotificationService.processScheduledReminders();
      } catch (error) {
        console.error('Error in reminder processor:', error);
      }
    }, 60000); // Check every minute

    console.log('Reminder processor started');
  }

  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Reminder processor stopped');
    }
  }
}