'use client';

import { useEffect, useState } from 'react';

export default function TestPage() {
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const testApi = async () => {
      try {
        const response = await fetch('/api/public/queue/schedule');
        if (response.ok) {
          setApiStatus('success');
          setMessage('✅ API connection successful!');
        } else {
          setApiStatus('error');
          setMessage('❌ API returned error status');
        }
      } catch (error) {
        setApiStatus('error');
        setMessage('❌ Failed to connect to API');
        console.error('API test failed:', error);
      }
    };

    testApi();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">API Connection Test</h1>
        {apiStatus === 'loading' && (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="ml-2">Testing API connection...</p>
          </div>
        )}
        {apiStatus === 'success' && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {message}
          </div>
        )}
        {apiStatus === 'error' && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {message}
          </div>
        )}
        <p className="mt-4 text-sm text-gray-600">
          Make sure Laravel server is running on http://localhost:8080
        </p>
      </div>
    </div>
  );
}