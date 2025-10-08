'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { AudioSample, Spectrogram, ArtifactType, VersionType } from '@/lib/types/database';
import FileUploader from './FileUploader';

interface DashboardClientProps {
  user: any;
  initialAudioSamples: AudioSample[];
  initialSpectrograms: Spectrogram[];
}

export default function DashboardClient({
  user,
  initialAudioSamples,
  initialSpectrograms,
}: DashboardClientProps) {
  const [audioSamples, setAudioSamples] = useState(initialAudioSamples);
  const [spectrograms, setSpectrograms] = useState(initialSpectrograms);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const handleUploadComplete = () => {
    router.refresh();
  };

  const artifactTypes: ArtifactType[] = ['distortion', 'reverb', 'bandlimit'];
  const versionTypes: VersionType[] = ['original', 'competitor', 'aicoustics'];

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Audio Samples Section */}
          <section className="border border-green-500/30 bg-black/80 p-4">
            <div className="border-b border-green-500/30 pb-2 mb-4">
              <h2 className="text-sm text-green-400">
                &gt; /audio_samples
              </h2>
            </div>

            <FileUploader
              type="audio"
              artifactTypes={artifactTypes}
              versionTypes={versionTypes}
              onUploadComplete={handleUploadComplete}
            />

            <div className="mt-6">
              <div className="text-xs text-green-500 mb-2">$ ls uploaded/</div>
              {audioSamples.length === 0 ? (
                <p className="text-green-400/50 text-xs">ls: cannot access 'uploaded/': No such file or directory</p>
              ) : (
                <div className="space-y-1 text-xs">
                  {audioSamples.map((sample) => (
                    <div
                      key={sample.id}
                      className="flex items-center justify-between p-2 border-l-2 border-green-500/30 hover:border-green-500 hover:bg-green-500/5 transition-all"
                    >
                      <div className="flex-1">
                        <span className="text-green-400">
                          {sample.artifact_type}_{sample.version_type}.wav
                        </span>
                        <span className="text-green-600 ml-4 text-[10px]">{sample.file_name}</span>
                      </div>
                      <audio controls className="h-6 scale-75">
                        <source src={sample.file_url} />
                      </audio>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Spectrograms Section */}
          <section className="border border-cyan-500/30 bg-black/80 p-4">
            <div className="border-b border-cyan-500/30 pb-2 mb-4">
              <h2 className="text-sm text-cyan-400">
                &gt; /spectrograms
              </h2>
            </div>

            <FileUploader
              type="spectrogram"
              artifactTypes={artifactTypes}
              versionTypes={versionTypes}
              onUploadComplete={handleUploadComplete}
            />

            <div className="mt-6">
              <div className="text-xs text-cyan-500 mb-2">$ ls images/</div>
              {spectrograms.length === 0 ? (
                <p className="text-cyan-400/50 text-xs">ls: cannot access 'images/': No such file or directory</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {spectrograms.map((spec) => (
                    <div key={spec.id} className="border border-cyan-500/20 hover:border-cyan-500/50 transition-all">
                      <img
                        src={spec.image_url}
                        alt={`${spec.artifact_type} ${spec.version_type}`}
                        className="w-full h-24 object-cover opacity-80 hover:opacity-100 transition-opacity"
                      />
                      <div className="p-2 border-t border-cyan-500/20">
                        <p className="text-[10px] text-cyan-400">
                          {spec.artifact_type}_{spec.version_type}.png
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
