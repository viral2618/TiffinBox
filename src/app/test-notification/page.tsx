"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useFCM } from '@/hooks/use-fcm';

export default function TestNotificationPage() {
  const { session } = useAuth();
  const { fcmToken, error } = useFCM();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [swStatus, setSwStatus] = useState<string>('Checking...');
  const [notifPermission, setNotifPermission] = useState<string>('Checking...');
  const [swSupported, setSwSupported] = useState<boolean>(false);

  useEffect(() => {
    // Check service worker support
    if (typeof window !== 'undefined') {
      setSwSupported('serviceWorker' in navigator);
      
      // Check notification permission
      if ('Notification' in window) {
        setNotifPermission(Notification.permission);
      } else {
        setNotifPermission('not-supported');
      }

      // Check service worker status
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
          .then((registration) => {
            if (registration.active) {
              setSwStatus(`Active (${registration.active.scriptURL.split('/').pop()})`);
            } else {
              setSwStatus('Registered but not active');
            }
          })
          .catch(() => setSwStatus('Not registered'));
      } else {
        setSwStatus('Not supported');
      }
    }
  }, []);

  const sendTestNotification = async () => {
    setLoading(true);
    setResult('⏳ Notification will be sent in 5 seconds... Close the tab now to test background notification!');
    
    // Wait 5 seconds before sending
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    try {
      const response = await fetch('/api/test-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Notification',
          message: 'This is a test notification from WhenFresh',
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult('✅ Notification sent successfully!');
      } else {
        setResult(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      setResult(`❌ Failed: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status.includes('Active') || status === 'granted') return 'text-green-600';
    if (status === 'denied' || status.includes('Not')) return 'text-red-600';
    return 'text-yellow-600';
  };

  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Test Notifications</h1>
      
      <div className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div>
          <h2 className="font-semibold mb-2">User Info:</h2>
          <p>Email: {session?.user?.email || 'Not logged in'}</p>
          <p>Role: {session?.user?.role || 'N/A'}</p>
        </div>

        <div className="border-t pt-4">
          <h2 className="font-semibold mb-3">System Status:</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Service Worker Support:</span>
              <span className={swSupported ? 'text-green-600' : 'text-red-600'}>
                {swSupported ? '✅ Supported' : '❌ Not Supported'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Service Worker Status:</span>
              <span className={getStatusColor(swStatus)}>{swStatus}</span>
            </div>
            <div className="flex justify-between">
              <span>Notification Permission:</span>
              <span className={getStatusColor(notifPermission)}>
                {notifPermission === 'granted' ? '✅ Granted' : 
                 notifPermission === 'denied' ? '❌ Denied' : 
                 notifPermission === 'default' ? '⚠️ Not Asked' : '❌ Not Supported'}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h2 className="font-semibold mb-2">FCM Status:</h2>
          <p className={fcmToken ? 'text-green-600' : 'text-red-600'}>
            {fcmToken ? '✅ Token obtained' : '❌ No token'}
          </p>
          {error && <p className="text-red-600">Error: {error}</p>}
          {fcmToken && (
            <p className="text-xs text-gray-500 mt-2 break-all">
              Token: {fcmToken.substring(0, 50)}...
            </p>
          )}
        </div>

        <button
          onClick={sendTestNotification}
          disabled={loading || !fcmToken}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send Test Notification'}
        </button>

        {result && (
          <div className={`p-4 rounded ${result.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {result}
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Make sure you're logged in</li>
            <li>Allow notification permission when prompted</li>
            <li>Click "Send Test Notification"</li>
            <li><strong>Background test:</strong> Close/minimize tab within 5 seconds</li>
            <li><strong>Foreground test:</strong> Keep tab open for 5 seconds</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
