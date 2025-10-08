'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Example, VersionType, AudioSample, Spectrogram } from '@/lib/types/database';
import { useRouter } from 'next/navigation';

interface ExampleUploaderProps {
  example: Example;
  audioSamples: AudioSample[];
  spectrograms: Spectrogram[];
}

export default function ExampleUploader({
  example,
  audioSamples,
  spectrograms,
}: ExampleUploaderProps) {
  const [versionType, setVersionType] = useState<VersionType>('original');
  const [competitorName, setCompetitorName] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [spectrogramFile, setSpectrogramFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleUpload = async () => {
    if (!audioFile && !spectrogramFile) {
      setError('Please select at least one file to upload');
      return;
    }

    if (versionType === 'competitor' && !competitorName.trim()) {
      setError('Please enter competitor name');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      // Upload audio file
      if (audioFile) {
        const audioPath = `${example.id}/${versionType}-${competitorName || 'none'}-${Date.now()}-${audioFile.name}`;

        const { error: audioUploadError } = await supabase.storage
          .from('audio')
          .upload(audioPath, audioFile, { cacheControl: '3600', upsert: false });

        if (audioUploadError) throw audioUploadError;

        const { data: { publicUrl: audioUrl } } = supabase.storage
          .from('audio')
          .getPublicUrl(audioPath);

        const { error: audioDbError } = await supabase
          .from('audio_samples')
          .upsert({
            example_id: example.id,
            version_type: versionType,
            competitor_name: versionType === 'competitor' ? competitorName : null,
            file_url: audioUrl,
            file_name: audioFile.name,
            file_size: audioFile.size,
            mime_type: audioFile.type,
          });

        if (audioDbError) throw audioDbError;
      }

      // Upload spectrogram file
      if (spectrogramFile) {
        const specPath = `${example.id}/${versionType}-${competitorName || 'none'}-${Date.now()}-${spectrogramFile.name}`;

        const { error: specUploadError } = await supabase.storage
          .from('spectrograms')
          .upload(specPath, spectrogramFile, { cacheControl: '3600', upsert: false });

        if (specUploadError) throw specUploadError;

        const { data: { publicUrl: specUrl } } = supabase.storage
          .from('spectrograms')
          .getPublicUrl(specPath);

        const { error: specDbError } = await supabase
          .from('spectrograms')
          .upsert({
            example_id: example.id,
            version_type: versionType,
            competitor_name: versionType === 'competitor' ? competitorName : null,
            image_url: specUrl,
            file_name: spectrogramFile.name,
            file_size: spectrogramFile.size,
            mime_type: spectrogramFile.type,
          });

        if (specDbError) throw specDbError;
      }

      setSuccess(`Uploaded successfully for ${versionType}`);
      setAudioFile(null);
      setSpectrogramFile(null);
      setCompetitorName('');

      // Reset file inputs
      const audioInput = document.getElementById(`audio-${example.id}`) as HTMLInputElement;
      const specInput = document.getElementById(`spec-${example.id}`) as HTMLInputElement;
      if (audioInput) audioInput.value = '';
      if (specInput) specInput.value = '';

      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const exampleAudio = audioSamples.filter(s => s.example_id === example.id);
  const exampleSpecs = spectrograms.filter(s => s.example_id === example.id);

  const getVersionData = (version: VersionType) => {
    const audio = exampleAudio.find(a => a.version_type === version);
    const spec = exampleSpecs.find(s => s.version_type === version);
    return { audio, spec };
  };

  return (
    <div className="border border-purple-500/30 bg-black/80 p-4 mb-6">
      <div className="border-b border-purple-500/30 pb-2 mb-4">
        <h3 className="text-sm text-purple-400">
          &gt; /examples/{example.name.toLowerCase().replace(/\s+/g, '_')}
        </h3>
      </div>

      {error && (
        <div className="border-l-2 border-red-500 bg-red-950/20 px-3 py-2 text-red-400 text-xs mb-3">
          error: {error}
        </div>
      )}

      {success && (
        <div className="border-l-2 border-purple-500 bg-purple-950/20 px-3 py-2 text-purple-400 text-xs mb-3">
          success: {success}
        </div>
      )}

      {/* Upload Section */}
      <div className="mb-4 space-y-3">
        <div>
          <label className="block text-purple-500 mb-1 text-xs">version:</label>
          <select
            value={versionType}
            onChange={(e) => setVersionType(e.target.value as VersionType)}
            className="w-full px-2 py-1 bg-black border border-purple-500/30 text-purple-400 focus:outline-none focus:border-purple-500 text-xs"
          >
            <option value="original">original</option>
            <option value="competitor">competitor</option>
            <option value="aicoustics">aicoustics</option>
          </select>
        </div>

        {versionType === 'competitor' && (
          <div>
            <label className="block text-purple-500 mb-1 text-xs">
              competitor_name:
            </label>
            <input
              type="text"
              value={competitorName}
              onChange={(e) => setCompetitorName(e.target.value)}
              placeholder="e.g. ElevenLabs, Dolby.io"
              className="w-full px-2 py-1 bg-black border border-purple-500/30 text-purple-400 focus:outline-none focus:border-purple-500 placeholder:text-purple-700 text-xs"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-purple-500 mb-1 text-xs">
              audio_file:
            </label>
            <input
              id={`audio-${example.id}`}
              type="file"
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
              accept="audio/*"
              className="w-full text-xs text-purple-400 file:mr-2 file:py-1 file:px-2 file:border file:border-purple-500/50 file:bg-black file:text-purple-400 hover:file:bg-purple-500/10 file:text-[10px]"
            />
          </div>

          <div>
            <label className="block text-purple-500 mb-1 text-xs">
              spectrogram:
            </label>
            <input
              id={`spec-${example.id}`}
              type="file"
              onChange={(e) => setSpectrogramFile(e.target.files?.[0] || null)}
              accept="image/*"
              className="w-full text-xs text-purple-400 file:mr-2 file:py-1 file:px-2 file:border file:border-purple-500/50 file:bg-black file:text-purple-400 hover:file:bg-purple-500/10 file:text-[10px]"
            />
          </div>
        </div>

        <button
          onClick={handleUpload}
          disabled={(!audioFile && !spectrogramFile) || uploading}
          className="w-full border border-purple-500/50 bg-black text-purple-400 py-2 px-3 hover:bg-purple-500/10 focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
        >
          {uploading ? 'uploading...' : '[ upload ]'}
        </button>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-3 gap-2 text-[10px]">
        {(['original', 'competitor', 'aicoustics'] as VersionType[]).map((version) => {
          const { audio, spec } = getVersionData(version);
          const hasAudio = !!audio;
          const hasSpec = !!spec;
          const competitorLabel = audio?.competitor_name || spec?.competitor_name;

          return (
            <div
              key={version}
              className="border border-purple-500/20 p-2 bg-black/50"
            >
              <div className="text-purple-400 mb-1 font-bold">
                {version === 'competitor' && competitorLabel ? competitorLabel : version}
              </div>
              <div className={hasAudio ? 'text-green-500' : 'text-gray-600'}>
                audio: {hasAudio ? '✓' : '✗'}
              </div>
              <div className={hasSpec ? 'text-green-500' : 'text-gray-600'}>
                spec: {hasSpec ? '✓' : '✗'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
