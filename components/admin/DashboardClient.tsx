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
  const versionTypes: VersionType[] = ['original', 'subtractive', 'generative'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Matrix-style animated background */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ff0020_1px,transparent_1px),linear-gradient(to_bottom,#00ff0020_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      {/* Header */}
      <header className="relative bg-black/50 backdrop-blur-md border-b border-green-500/30 shadow-[0_0_20px_rgba(0,255,0,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-green-400 tracking-wider font-mono flex items-center gap-3">
                <span className="text-green-500">&gt;</span> ADMIN_DASHBOARD
                <span className="animate-pulse text-green-400">_</span>
              </h1>
              <p className="text-sm text-green-300/70 mt-2 font-mono">SYSTEM_USER: {user.email}</p>
            </div>
            <div className="flex gap-4">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 font-mono text-sm"
              >
                VIEW_DEMO
              </a>
              <button
                onClick={handleLogout}
                className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-500 hover:to-red-600 transition-all shadow-lg shadow-red-500/20 font-mono text-sm"
              >
                LOGOUT
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Audio Samples Section */}
          <section className="bg-black/60 backdrop-blur-md rounded-2xl border border-green-500/30 p-6 shadow-[0_0_30px_rgba(0,255,0,0.1)] hover:shadow-[0_0_40px_rgba(0,255,0,0.2)] transition-shadow">
            <h2 className="text-2xl font-bold text-green-400 mb-6 font-mono flex items-center gap-2">
              <span className="text-green-500">◆</span> AUDIO_SAMPLES
            </h2>

            <FileUploader
              type="audio"
              artifactTypes={artifactTypes}
              versionTypes={versionTypes}
              onUploadComplete={handleUploadComplete}
            />

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-green-300 mb-4 font-mono">UPLOADED_FILES</h3>
              {audioSamples.length === 0 ? (
                <p className="text-green-400/50 text-sm font-mono">[ EMPTY ] No audio samples uploaded yet</p>
              ) : (
                <div className="space-y-3">
                  {audioSamples.map((sample) => (
                    <div
                      key={sample.id}
                      className="flex items-center justify-between p-4 bg-green-950/20 rounded-xl border border-green-500/20 hover:border-green-500/40 transition-all"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-bold text-green-400 font-mono uppercase">
                          {sample.artifact_type} - {sample.version_type}
                        </p>
                        <p className="text-xs text-green-300/60 font-mono mt-1">{sample.file_name}</p>
                      </div>
                      <audio controls className="h-8">
                        <source src={sample.file_url} />
                      </audio>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Spectrograms Section */}
          <section className="bg-black/60 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_30px_rgba(0,255,255,0.1)] hover:shadow-[0_0_40px_rgba(0,255,255,0.2)] transition-shadow">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6 font-mono flex items-center gap-2">
              <span className="text-cyan-500">◆</span> SPECTROGRAMS
            </h2>

            <FileUploader
              type="spectrogram"
              artifactTypes={artifactTypes}
              versionTypes={versionTypes}
              onUploadComplete={handleUploadComplete}
            />

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-cyan-300 mb-4 font-mono">UPLOADED_IMAGES</h3>
              {spectrograms.length === 0 ? (
                <p className="text-cyan-400/50 text-sm font-mono">[ EMPTY ] No spectrograms uploaded yet</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {spectrograms.map((spec) => (
                    <div key={spec.id} className="space-y-2 group">
                      <div className="relative overflow-hidden rounded-xl border border-cyan-500/30 hover:border-cyan-500/60 transition-all">
                        <img
                          src={spec.image_url}
                          alt={`${spec.artifact_type} ${spec.version_type}`}
                          className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                      <p className="text-xs font-bold text-cyan-400 font-mono uppercase">
                        {spec.artifact_type} - {spec.version_type}
                      </p>
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
