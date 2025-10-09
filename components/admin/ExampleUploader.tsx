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

  const handleDeleteExample = async () => {
    if (!confirm(`Delete example "${example.name}"? This will remove all associated audio and spectrograms.`)) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('examples')
        .delete()
        .eq('id', example.id);

      if (deleteError) throw deleteError;

      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to delete example');
    }
  };

  return (
    <div className="border border-green-500/30 bg-black/80 p-4 mb-6">
      <div className="border-b border-green-500/30 pb-2 mb-4 flex justify-between items-center">
        <h3 className="text-sm text-green-400">
          &gt; /examples/{example.name.toLowerCase().replace(/\s+/g, '_')}
        </h3>
        <button
          onClick={handleDeleteExample}
          className="text-xs text-red-400 border border-red-500/50 px-2 py-1 hover:bg-red-500/10 transition-colors"
        >
          [delete]
        </button>
      </div>

      {error && (
        <div className="border-l-2 border-red-500 bg-red-950/20 px-3 py-2 text-red-400 text-xs mb-3">
          error: {error}
        </div>
      )}

      {success && (
        <div className="border-l-2 border-green-500 bg-green-950/20 px-3 py-2 text-green-400 text-xs mb-3">
          success: {success}
        </div>
      )}

      {/* Upload Section */}
      <div className="mb-4 space-y-3">
        <div>
          <label className="block text-green-500 mb-1 text-xs">version:</label>
          <select
            value={versionType}
            onChange={(e) => setVersionType(e.target.value as VersionType)}
            className="w-full px-2 py-1 bg-black border border-green-500/30 text-green-400 focus:outline-none focus:border-green-500 text-xs"
          >
            <option value="original">original</option>
            <option value="competitor">competitor</option>
            <option value="aicoustics">aicoustics</option>
          </select>
        </div>

        {versionType === 'competitor' && (
          <div>
            <label className="block text-green-500 mb-1 text-xs">
              competitor_name:
            </label>
            <input
              type="text"
              value={competitorName}
              onChange={(e) => setCompetitorName(e.target.value)}
              placeholder="e.g. ElevenLabs, Dolby.io"
              className="w-full px-2 py-1 bg-black border border-green-500/30 text-green-400 focus:outline-none focus:border-green-500 placeholder:text-green-700 text-xs"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-green-500 mb-1 text-xs">
              audio_file:
            </label>
            <input
              id={`audio-${example.id}`}
              type="file"
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
              accept="audio/*"
              className="w-full text-xs text-green-400 file:mr-2 file:py-1 file:px-2 file:border file:border-green-500/50 file:bg-black file:text-green-400 hover:file:bg-green-500/10 file:text-[10px]"
            />
          </div>

          <div>
            <label className="block text-green-500 mb-1 text-xs">
              spectrogram:
            </label>
            <input
              id={`spec-${example.id}`}
              type="file"
              onChange={(e) => setSpectrogramFile(e.target.files?.[0] || null)}
              accept="image/*"
              className="w-full text-xs text-green-400 file:mr-2 file:py-1 file:px-2 file:border file:border-green-500/50 file:bg-black file:text-green-400 hover:file:bg-green-500/10 file:text-[10px]"
            />
          </div>
        </div>

        <button
          onClick={handleUpload}
          disabled={(!audioFile && !spectrogramFile) || uploading}
          className="w-full border border-green-500/50 bg-black text-green-400 py-2 px-3 hover:bg-green-500/10 focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
        >
          {uploading ? 'uploading...' : '[ upload ]'}
        </button>
      </div>

      {/* Status Grid with Previews */}
      <div className="grid grid-cols-3 gap-3 text-[10px]">
        {(['original', 'competitor', 'aicoustics'] as VersionType[]).map((version) => {
          const { audio, spec } = getVersionData(version);
          const hasAudio = !!audio;
          const hasSpec = !!spec;
          const competitorLabel = audio?.competitor_name || spec?.competitor_name;

          return (
            <div
              key={version}
              className="border border-green-500/20 p-3 bg-black/50 space-y-2"
            >
              <div className="text-green-400 mb-2 font-bold text-xs">
                {version === 'competitor' && competitorLabel ? competitorLabel : version}
              </div>

              {/* Spectrogram Preview */}
              {hasSpec && spec ? (
                <div className="relative w-full aspect-video bg-black rounded overflow-hidden border border-green-500/30">
                  <img
                    src={spec.image_url}
                    alt={`${version} spectrogram`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-full aspect-video bg-black/30 rounded border border-green-500/10 flex items-center justify-center">
                  <span className="text-gray-600 text-[9px]">no spectrogram</span>
                </div>
              )}

              {/* Audio Preview */}
              {hasAudio && audio ? (
                <audio controls className="w-full h-6 opacity-80 hover:opacity-100 transition-opacity">
                  <source src={audio.file_url} />
                </audio>
              ) : (
                <div className="w-full h-6 bg-black/30 rounded border border-green-500/10 flex items-center justify-center">
                  <span className="text-gray-600 text-[9px]">no audio</span>
                </div>
              )}

              {/* Status Indicators */}
              <div className="flex gap-3 text-[9px] pt-1">
                <div className={hasAudio ? 'text-cyan-400' : 'text-gray-600'}>
                  audio: {hasAudio ? '✓' : '✗'}
                </div>
                <div className={hasSpec ? 'text-cyan-400' : 'text-gray-600'}>
                  spec: {hasSpec ? '✓' : '✗'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
