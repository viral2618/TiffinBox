'use client';

import { useState } from 'react';

export default function TestBackgroundNotification() {
  const [status, setStatus] = useState('');

  const testNotification = async () => {
    try {
      setStatus('Checking service worker...');
      
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        setStatus('❌ Service worker not registered');
        return;
      }
      
      setStatus('✅ Service worker active. Close this tab and send notification from backend.');
    } catch (error) {
      setStatus('❌ Error: ' + error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Background Notification</h1>
      <button onClick={testNotification}>Check Setup</button>
      <p>{status}</p>
      <hr />
      <p>Steps:</p>
      <ol>
        <li>Click "Check Setup"</li>
        <li>If service worker is active, close this tab</li>
        <li>Send notification from backend</li>
        <li>You should see system notification</li>
      </ol>
    </div>
  );
}
