'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { PageSettings } from '@/lib/types/database';
import { useRouter } from 'next/navigation';

interface PageSettingsEditorProps {
  settings: PageSettings | null;
}

export default function PageSettingsEditor({ settings }: PageSettingsEditorProps) {
  const [pageTitle, setPageTitle] = useState(settings?.page_title || 'Subtractive vs. Generative');
  const [pageDescription, setPageDescription] = useState(
    settings?.page_description ||
    'These spectrograms show the time-frequency representations of audio signals...'
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (settings) {
        // Update existing settings
        const { error: updateError } = await supabase
          .from('page_settings')
          .update({
            page_title: pageTitle,
            page_description: pageDescription,
          })
          .eq('id', settings.id);

        if (updateError) throw updateError;
      } else {
        // Insert new settings
        const { error: insertError } = await supabase
          .from('page_settings')
          .insert({
            page_title: pageTitle,
            page_description: pageDescription,
          });

        if (insertError) throw insertError;
      }

      setSuccess('Page settings saved successfully!');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-cyan-500/30 bg-black/80 p-4 mb-6">
      <div className="border-b border-cyan-500/30 pb-2 mb-4">
        <h2 className="text-sm text-cyan-400">&gt; /page_settings</h2>
      </div>

      {error && (
        <div className="border-l-2 border-red-500 bg-red-950/20 px-3 py-2 text-red-400 text-xs mb-3">
          error: {error}
        </div>
      )}

      {success && (
        <div className="border-l-2 border-cyan-500 bg-cyan-950/20 px-3 py-2 text-cyan-400 text-xs mb-3">
          success: {success}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-cyan-500 mb-1 text-xs">
            page_title:
          </label>
          <input
            type="text"
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
            placeholder="e.g. Subtractive vs. Generative"
            className="w-full px-2 py-1 bg-black border border-cyan-500/30 text-cyan-400 focus:outline-none focus:border-cyan-500 placeholder:text-cyan-700 text-xs"
          />
        </div>

        <div>
          <label className="block text-cyan-500 mb-1 text-xs">
            page_description:
          </label>
          <textarea
            value={pageDescription}
            onChange={(e) => setPageDescription(e.target.value)}
            placeholder="Description text..."
            rows={6}
            className="w-full px-2 py-1 bg-black border border-cyan-500/30 text-cyan-400 focus:outline-none focus:border-cyan-500 placeholder:text-cyan-700 text-xs resize-y"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full border border-cyan-500/50 bg-black text-cyan-400 py-2 px-3 hover:bg-cyan-500/10 focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
        >
          {saving ? 'saving...' : '[ save settings ]'}
        </button>
      </div>
    </div>
  );
}
