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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Logged in as {user.email}</p>
            </div>
            <div className="flex gap-4">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                View Demo
              </a>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Audio Samples Section */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Audio Samples</h2>

            <FileUploader
              type="audio"
              artifactTypes={artifactTypes}
              versionTypes={versionTypes}
              onUploadComplete={handleUploadComplete}
            />

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Files</h3>
              {audioSamples.length === 0 ? (
                <p className="text-gray-500 text-sm">No audio samples uploaded yet</p>
              ) : (
                <div className="space-y-2">
                  {audioSamples.map((sample) => (
                    <div
                      key={sample.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {sample.artifact_type} - {sample.version_type}
                        </p>
                        <p className="text-xs text-gray-500">{sample.file_name}</p>
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
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Spectrograms</h2>

            <FileUploader
              type="spectrogram"
              artifactTypes={artifactTypes}
              versionTypes={versionTypes}
              onUploadComplete={handleUploadComplete}
            />

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Images</h3>
              {spectrograms.length === 0 ? (
                <p className="text-gray-500 text-sm">No spectrograms uploaded yet</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {spectrograms.map((spec) => (
                    <div key={spec.id} className="space-y-2">
                      <img
                        src={spec.image_url}
                        alt={`${spec.artifact_type} ${spec.version_type}`}
                        className="w-full h-32 object-cover rounded-md"
                      />
                      <p className="text-xs font-medium text-gray-900">
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
