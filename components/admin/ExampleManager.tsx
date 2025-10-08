'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Example } from '@/lib/types/database';
import { useRouter } from 'next/navigation';

interface ExampleManagerProps {
  examples: Example[];
}

export default function ExampleManager({ examples }: ExampleManagerProps) {
  const [newExampleName, setNewExampleName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleCreateExample = async () => {
    if (!newExampleName.trim()) {
      setError('Please enter an example name');
      return;
    }

    setCreating(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('examples')
        .insert({
          name: newExampleName,
          display_order: examples.length + 1,
        });

      if (insertError) throw insertError;

      setNewExampleName('');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to create example');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="border border-green-500/30 bg-black/80 p-4 mb-6">
      <div className="border-b border-green-500/30 pb-2 mb-4">
        <h2 className="text-sm text-green-400">&gt; /examples/new</h2>
      </div>

      {error && (
        <div className="border-l-2 border-red-500 bg-red-950/20 px-3 py-2 text-red-400 text-xs mb-3">
          error: {error}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-green-500 mb-1 text-xs">
            example_name:
          </label>
          <input
            type="text"
            value={newExampleName}
            onChange={(e) => setNewExampleName(e.target.value)}
            placeholder="e.g. Distortion and Clipping"
            className="w-full px-2 py-1 bg-black border border-green-500/30 text-green-400 focus:outline-none focus:border-green-500 placeholder:text-green-700 text-xs"
            onKeyPress={(e) => e.key === 'Enter' && handleCreateExample()}
          />
        </div>

        <button
          onClick={handleCreateExample}
          disabled={!newExampleName.trim() || creating}
          className="w-full border border-green-500/50 bg-black text-green-400 py-2 px-3 hover:bg-green-500/10 focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
        >
          {creating ? 'creating...' : '[ create example ]'}
        </button>
      </div>

      {examples.length > 0 && (
        <div className="mt-4">
          <div className="text-xs text-green-500 mb-2">$ ls examples/</div>
          <div className="space-y-1">
            {examples.map((example) => (
              <div
                key={example.id}
                className="text-xs text-green-400 px-2 py-1 border-l-2 border-green-500/30"
              >
                {example.display_order}. {example.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
