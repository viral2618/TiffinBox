import { NextRequest, NextResponse } from 'next/server';
import { captureException, captureMessage } from '@/lib/bugsink';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    console.log('🐛 Test API: Received request with type:', type);

    if (type === 'error') {
      const testError = new Error('Test server error from Bugsink API endpoint');
      console.log('🐛 Test API: Throwing test error');
      captureException(testError, { 
        endpoint: '/api/test-bugsink',
        requestType: 'GET',
        testType: 'server-error'
      });
      throw testError;
    }

    if (type === 'message') {
      console.log('🐛 Test API: Sending test message');
      captureMessage('Test message from Bugsink API endpoint', 'info');
      return NextResponse.json({ 
        success: true, 
        message: 'Test message sent to Bugsink successfully',
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Bugsink test endpoint is working',
      availableTypes: ['error', 'message'],
      usage: 'Add ?type=error or ?type=message to test different scenarios'
    });

  } catch (error) {
    console.log('🐛 Test API: Caught error, sending to Bugsink');
    
    if (error instanceof Error) {
      captureException(error, { 
        endpoint: '/api/test-bugsink',
        caught: true 
      });
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Error captured and sent to Bugsink'
      },
      { status: 500 }
    );
  }
}