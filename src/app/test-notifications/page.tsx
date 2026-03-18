"use client";

import { useState, useEffect } from 'react';
import { getFCMToken } from '@/lib/firebase';
import { Bell, CheckCircle, XCircle, AlertCircle, Send } from 'lucide-react';

export default function NotificationTestPage() {
  const [status, setStatus] = useState({
    browserSupport: false,
    notificationPermission: 'default' as NotificationPermission,
    serviceWorkerRegistered: false,
    fcmToken: '',
    isVisible: true
  });
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    checkStatus();
    
    const handleVisibilityChange = () => {
      setStatus(prev => ({ ...prev, isVisible: !document.hidden }));
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const checkStatus = async () => {
    const browserSupport = 'Notification' in window && 'serviceWorker' in navigator;
    const permission = browserSupport ? Notification.permission : 'default';
    
    let swRegistered = false;
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
      swRegistered = !!registration;
    }

    setStatus({
      browserSupport,
      notificationPermission: permission,
      serviceWorkerRegistered: swRegistered,
      fcmToken: '',
      isVisible: !document.hidden
    });
  };

  const requestPermission = async () => {
    setLoading(true);
    try {
      const token = await getFCMToken();
      if (token) {
        setStatus(prev => ({ 
          ...prev, 
          notificationPermission: 'granted',
          fcmToken: token 
        }));
        setTestResult('✅ Permission granted! FCM token obtained.');
      } else {
        setTestResult('❌ Failed to get FCM token. Check console for errors.');
      }
    } catch (error) {
      setTestResult('❌ Error: ' + (error as Error).message);
    } finally {
      setLoading(false);
      await checkStatus();
    }
  };

  const sendTestNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from your app!',
        icon: '/icons/icon-192x192.svg',
        badge: '/icons/icon-72x72.svg',
        tag: 'test-notification'
      } as NotificationOptions);
      setTestResult('✅ Test notification sent!');
    } else {
      setTestResult('❌ Permission not granted');
    }
  };

  const StatusBadge = ({ condition, label }: { condition: boolean; label: string }) => (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-white border">
      {condition ? (
        <CheckCircle className="w-5 h-5 text-green-600" />
      ) : (
        <XCircle className="w-5 h-5 text-red-600" />
      )}
      <span className="text-sm font-medium">{label}</span>
    </div>
  );

  const PermissionBadge = () => {
    const colors = {
      granted: 'bg-green-100 text-green-800 border-green-300',
      denied: 'bg-red-100 text-red-800 border-red-300',
      default: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    };

    const icons = {
      granted: <CheckCircle className="w-5 h-5" />,
      denied: <XCircle className="w-5 h-5" />,
      default: <AlertCircle className="w-5 h-5" />
    };

    return (
      <div className={`flex items-center gap-2 p-3 rounded-lg border ${colors[status.notificationPermission]}`}>
        {icons[status.notificationPermission]}
        <span className="text-sm font-medium">
          Permission: {status.notificationPermission}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-8 h-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900">Notification Testing</h1>
          </div>

          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">System Status</h2>
            
            <StatusBadge 
              condition={status.browserSupport} 
              label="Browser Support" 
            />
            
            <PermissionBadge />
            
            <StatusBadge 
              condition={status.serviceWorkerRegistered} 
              label="Service Worker Registered" 
            />
            
            <div className={`flex items-center gap-2 p-3 rounded-lg border ${
              status.isVisible 
                ? 'bg-blue-100 text-blue-800 border-blue-300' 
                : 'bg-purple-100 text-purple-800 border-purple-300'
            }`}>
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">
                Tab Status: {status.isVisible ? 'Visible (Foreground)' : 'Hidden (Background)'}
              </span>
            </div>

            {status.fcmToken && (
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-xs font-medium text-gray-600 mb-1">FCM Token:</p>
                <p className="text-xs text-gray-800 break-all font-mono">{status.fcmToken}</p>
              </div>
            )}
          </div>

          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Actions</h2>
            
            {status.notificationPermission !== 'granted' && (
              <button
                onClick={requestPermission}
                disabled={loading || !status.browserSupport}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Bell className="w-5 h-5" />
                {loading ? 'Requesting...' : 'Request Notification Permission'}
              </button>
            )}

            {status.notificationPermission === 'granted' && (
              <button
                onClick={sendTestNotification}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Send className="w-5 h-5" />
                Send Test Notification
              </button>
            )}

            <button
              onClick={checkStatus}
              className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Refresh Status
            </button>
          </div>

          {testResult && (
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-900">{testResult}</p>
            </div>
          )}

          <div className="mt-8 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-2">Testing Instructions:</h3>
            <ol className="text-sm text-amber-800 space-y-1 list-decimal list-inside">
              <li>Click "Request Notification Permission" and allow notifications</li>
              <li>Click "Send Test Notification" to test foreground notifications</li>
              <li>Minimize this tab or switch to another tab</li>
              <li>Send a notification from your backend to test background notifications</li>
              <li>Check if notification appears when tab is hidden</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
