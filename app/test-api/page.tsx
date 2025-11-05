'use client';

import { useState } from 'react';

export default function TestAPIPage() {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testGetBatch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/getBatch');
      const data = await res.json();
      
      console.log('Status:', res.status);
      console.log('Response:', data);
      
      setResponse({
        status: res.status,
        ok: res.ok,
        data: data
      });
    } catch (err: any) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-8">API Test Page</h1>
        
        <button
          onClick={testGetBatch}
          disabled={loading}
          className="px-6 py-3 bg-[#fee801] text-black rounded-lg font-semibold hover:scale-105 transition-transform disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test GET /api/getBatch'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-500 font-bold">Error:</p>
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {response && (
          <div className="mt-8 space-y-4">
            <div className="bg-surface p-4 rounded-lg border border-text-secondary/20">
              <p className="text-text-secondary mb-2">Status Code:</p>
              <p className={`text-2xl font-bold ${response.ok ? 'text-green-400' : 'text-red-400'}`}>
                {response.status} {response.ok ? '✅' : '❌'}
              </p>
            </div>

            <div className="bg-surface p-4 rounded-lg border border-text-secondary/20">
              <p className="text-text-secondary mb-2">Response Data:</p>
              <pre className="text-text-primary text-xs overflow-auto bg-background p-4 rounded">
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </div>

            {response.data?.words && (
              <div className="bg-surface p-4 rounded-lg border border-text-secondary/20">
                <p className="text-text-secondary mb-2">Words Count:</p>
                <p className="text-2xl font-bold text-[#fee801]">
                  {response.data.words.length} words
                </p>
                
                {response.data.words.length > 0 && (
                  <div className="mt-4">
                    <p className="text-text-secondary mb-2">Sample Word:</p>
                    <div className="bg-background p-3 rounded">
                      <p className="text-text-primary"><strong>Indo:</strong> {response.data.words[0].indo}</p>
                      <p className="text-text-primary"><strong>English:</strong> {response.data.words[0].english}</p>
                      <p className="text-text-primary"><strong>Category:</strong> {response.data.words[0].category}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
