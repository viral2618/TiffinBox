'use client';

import { useState } from 'react';
import { captureException, captureMessage } from '@/lib/bugsink';

export default function BugsinkTest() {
  const [status, setStatus] = useState<string>('');

  const testClientError = () => {
    try {
      console.log('🐛 Test Component: Triggering client error');
      setStatus('Triggering client error...');
      throw new Error('Test client error from Bugsink component');
    } catch (error) {
      if (error instanceof Error) {
        captureException(error, { 
          component: 'BugsinkTest',
          action: 'testClientError',
          userTriggered: true
        });
      }
      setStatus('Client error sent to Bugsink ✅');
    }
  };

  const testClientMessage = () => {
    console.log('🐛 Test Component: Sending client message');
    setStatus('Sending client message...');
    captureMessage('Test message from Bugsink component', 'info');
    setStatus('Client message sent to Bugsink ✅');
  };

  const testUnhandledError = () => {
    console.log('🐛 Test Component: Triggering unhandled error');
    setStatus('Triggering unhandled error...');
    // This will be caught by the error boundary
    throw new Error('Unhandled test error from Bugsink component');
  };

  const testPromiseRejection = () => {
    console.log('🐛 Test Component: Triggering promise rejection');
    setStatus('Triggering promise rejection...');
    Promise.reject(new Error('Test promise rejection from Bugsink component'));
    setStatus('Promise rejection triggered ✅');
  };

  const testServerError = async () => {
    try {
      console.log('🐛 Test Component: Testing server error');
      setStatus('Testing server error...');
      const response = await fetch('/api/test-bugsink?type=error');
      const data = await response.json();
      setStatus(`Server error test: ${data.message} ✅`);
    } catch (error) {
      setStatus('Server error test failed ❌');
    }
  };

  const testServerMessage = async () => {
    try {
      console.log('🐛 Test Component: Testing server message');
      setStatus('Testing server message...');
      const response = await fetch('/api/test-bugsink?type=message');
      const data = await response.json();
      setStatus(`Server message test: ${data.message} ✅`);
    } catch (error) {
      setStatus('Server message test failed ❌');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">🐛 Bugsink Error Tracking Test</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={testClientError}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Test Client Error
          </button>
          
          <button
            onClick={testClientMessage}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Test Client Message
          </button>
          
          <button
            onClick={testUnhandledError}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
          >
            Test Unhandled Error
          </button>
          
          <button
            onClick={testPromiseRejection}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            Test Promise Rejection
          </button>
          
          <button
            onClick={testServerError}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors"
          >
            Test Server Error
          </button>
          
          <button
            onClick={testServerMessage}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Test Server Message
          </button>
        </div>
        
        {status && (
          <div className="mt-4 p-3 bg-gray-100 rounded border">
            <p className="text-sm font-mono">{status}</p>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">Test Instructions:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Check browser console for 🐛 logs</li>
            <li>• Visit <a href="https://bugsink.zeeshanali.space/6" target="_blank" rel="noopener noreferrer" className="underline">Bugsink Dashboard</a> to see captured errors</li>
            <li>• Each button tests different error scenarios</li>
            <li>• All errors should appear in the dashboard within seconds</li>
          </ul>
        </div>
      </div>
    </div>
  );
}