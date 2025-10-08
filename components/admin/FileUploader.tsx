'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ArtifactType, VersionType } from '@/lib/types/database';

interface FileUploaderProps {
  type: 'audio' | 'spectrogram';
  artifactTypes: ArtifactType[];
  versionTypes: VersionType[];
  onUploadComplete: () => void;
}

export default function FileUploader({
  type,
  artifactTypes,
  versionTypes,
  onUploadComplete,
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [artifactType, setArtifactType] = useState<ArtifactType>('distortion');
  const [versionType, setVersionType] = useState<VersionType>('original');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setSuccess('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const bucket = type === 'audio' ? 'audio' : 'spectrograms';
      const folder = artifactType;
      const fileName = `${versionType}-${Date.now()}-${file.name}`;
      const filePath = `${folder}/${fileName}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(filePath);

      // Insert metadata into database
      const table = type === 'audio' ? 'audio_samples' : 'spectrograms';
      const urlField = type === 'audio' ? 'file_url' : 'image_url';

      const { error: dbError } = await supabase.from(table).upsert(
        {
          artifact_type: artifactType,
          version_type: versionType,
          [urlField]: publicUrl,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
        },
        {
          onConflict: 'artifact_type,version_type',
        }
      );

      if (dbError) throw dbError;

      setSuccess('File uploaded successfully!');
      setFile(null);

      // Reset file input
      const fileInput = document.getElementById(`${type}-file-input`) as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      onUploadComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const terminalColor = type === 'audio' ? 'green' : 'cyan';

  return (
    <div className="space-y-3 text-xs">
      {error && (
        <div className="border-l-2 border-red-500 bg-red-950/20 px-3 py-2 text-red-400">
          error: {error}
        </div>
      )}

      {success && (
        <div className={`border-l-2 border-${terminalColor}-500 bg-${terminalColor}-950/20 px-3 py-2 text-${terminalColor}-400`}>
          success: {success}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={type === 'audio' ? 'block text-green-500 mb-1' : 'block text-cyan-500 mb-1'}>
            artifact:
          </label>
          <select
            value={artifactType}
            onChange={(e) => setArtifactType(e.target.value as ArtifactType)}
            className={type === 'audio'
              ? 'w-full px-2 py-1 bg-black border border-green-500/30 text-green-400 focus:outline-none focus:border-green-500'
              : 'w-full px-2 py-1 bg-black border border-cyan-500/30 text-cyan-400 focus:outline-none focus:border-cyan-500'
            }
          >
            {artifactTypes.map((type) => (
              <option key={type} value={type} className="bg-black">
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={type === 'audio' ? 'block text-green-500 mb-1' : 'block text-cyan-500 mb-1'}>
            version:
          </label>
          <select
            value={versionType}
            onChange={(e) => setVersionType(e.target.value as VersionType)}
            className={type === 'audio'
              ? 'w-full px-2 py-1 bg-black border border-green-500/30 text-green-400 focus:outline-none focus:border-green-500'
              : 'w-full px-2 py-1 bg-black border border-cyan-500/30 text-cyan-400 focus:outline-none focus:border-cyan-500'
            }
          >
            {versionTypes.map((type) => (
              <option key={type} value={type} className="bg-black">
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={type === 'audio' ? 'block text-green-500 mb-1' : 'block text-cyan-500 mb-1'}>
          $ select file
        </label>
        <input
          id={`${type}-file-input`}
          type="file"
          onChange={handleFileChange}
          accept={type === 'audio' ? 'audio/*' : 'image/*'}
          className={type === 'audio'
            ? 'w-full text-xs text-green-400 file:mr-3 file:py-1 file:px-3 file:border file:border-green-500/50 file:bg-black file:text-green-400 hover:file:bg-green-500/10'
            : 'w-full text-xs text-cyan-400 file:mr-3 file:py-1 file:px-3 file:border file:border-cyan-500/50 file:bg-black file:text-cyan-400 hover:file:bg-cyan-500/10'
          }
        />
        {file && (
          <p className={type === 'audio' ? 'text-[10px] text-green-500/70 mt-1' : 'text-[10px] text-cyan-500/70 mt-1'}>
            → {file.name} ({(file.size / 1024 / 1024).toFixed(2)}mb)
          </p>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className={type === 'audio'
          ? 'w-full border border-green-500/50 bg-black text-green-400 py-2 px-3 hover:bg-green-500/10 focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
          : 'w-full border border-cyan-500/50 bg-black text-cyan-400 py-2 px-3 hover:bg-cyan-500/10 focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
        }
      >
        {uploading ? 'uploading...' : '[ upload ]'}
      </button>
    </div>
  );
}
