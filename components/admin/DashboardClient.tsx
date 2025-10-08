'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { AudioSample, Spectrogram, Example } from '@/lib/types/database';
import ExampleManager from './ExampleManager';
import ExampleUploader from './ExampleUploader';

interface DashboardClientProps {
  user: any;
  examples: Example[];
  audioSamples: AudioSample[];
  spectrograms: Spectrogram[];
}

export default function DashboardClient({
  user,
  examples,
  audioSamples,
  spectrograms,
}: DashboardClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      {/* Scanline effect */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,255,0,0.02)_50%)] bg-[length:100%_4px] animate-[scan_8s_linear_infinite]"></div>

      {/* Terminal Header */}
      <header className="border-b border-green-500/50 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-green-400 text-sm mb-2">
                <span className="text-green-500">root@aicoustics</span>:<span className="text-blue-400">~/admin</span>$ <span className="animate-pulse">█</span>
              </div>
              <p className="text-xs text-green-500/70">logged_in_as: {user.email}</p>
            </div>
            <div className="flex gap-3 text-xs">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-green-500/50 text-green-400 hover:bg-green-500/10 transition-colors"
              >
                [view_demo]
              </a>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors"
              >
                [logout]
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Example Manager - Create New Examples */}
        <ExampleManager examples={examples} />

        {/* Example Uploaders - One for each example */}
        <div className="space-y-6">
          {examples.length === 0 ? (
            <div className="border border-green-500/30 bg-black/80 p-8 text-center">
              <p className="text-green-400/50 text-xs">
                No examples found. Create your first example above to get started.
              </p>
            </div>
          ) : (
            examples
              .sort((a, b) => a.display_order - b.display_order)
              .map((example) => (
                <ExampleUploader
                  key={example.id}
                  example={example}
                  audioSamples={audioSamples}
                  spectrograms={spectrograms}
                />
              ))
          )}
        </div>
      </main>
    </div>
  );
}
