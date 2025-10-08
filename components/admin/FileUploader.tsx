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

  const sectionColor = type === 'audio' ? 'green' : 'cyan';

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl text-sm font-mono">
          <span className="text-red-400">ERROR:</span> {error}
        </div>
      )}

      {success && (
        <div className={`bg-${sectionColor}-900/30 border border-${sectionColor}-500/50 text-${sectionColor}-300 px-4 py-3 rounded-xl text-sm font-mono`}>
          <span className={`text-${sectionColor}-400`}>SUCCESS:</span> {success}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-semibold text-${sectionColor}-300 mb-2 font-mono`}>
            ARTIFACT_TYPE
          </label>
          <select
            value={artifactType}
            onChange={(e) => setArtifactType(e.target.value as ArtifactType)}
            className={`w-full px-3 py-2 bg-black/40 border border-${sectionColor}-500/30 rounded-lg text-${sectionColor}-100 focus:outline-none focus:ring-2 focus:ring-${sectionColor}-500 focus:border-transparent font-mono uppercase`}
          >
            {artifactTypes.map((type) => (
              <option key={type} value={type} className="bg-gray-900">
                {type.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={`block text-sm font-semibold text-${sectionColor}-300 mb-2 font-mono`}>
            VERSION_TYPE
          </label>
          <select
            value={versionType}
            onChange={(e) => setVersionType(e.target.value as VersionType)}
            className={`w-full px-3 py-2 bg-black/40 border border-${sectionColor}-500/30 rounded-lg text-${sectionColor}-100 focus:outline-none focus:ring-2 focus:ring-${sectionColor}-500 focus:border-transparent font-mono uppercase`}
          >
            {versionTypes.map((type) => (
              <option key={type} value={type} className="bg-gray-900">
                {type.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={`block text-sm font-semibold text-${sectionColor}-300 mb-2 font-mono`}>
          {type === 'audio' ? 'AUDIO_FILE' : 'SPECTROGRAM_IMAGE'}
        </label>
        <input
          id={`${type}-file-input`}
          type="file"
          onChange={handleFileChange}
          accept={type === 'audio' ? 'audio/*' : 'image/*'}
          className={`w-full text-sm text-${sectionColor}-200 font-mono file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-${sectionColor}-600 file:text-white hover:file:bg-${sectionColor}-500 file:transition-colors file:font-mono`}
        />
        {file && (
          <p className={`text-xs text-${sectionColor}-400/70 mt-2 font-mono`}>
            &gt; SELECTED: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className={`w-full bg-gradient-to-r from-${sectionColor}-600 to-${sectionColor}-500 text-white py-3 px-4 rounded-lg font-bold hover:from-${sectionColor}-500 hover:to-${sectionColor}-400 focus:outline-none focus:ring-2 focus:ring-${sectionColor}-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-${sectionColor}-500/20 font-mono tracking-wider`}
      >
        {uploading ? '[ UPLOADING... ]' : '[ UPLOAD_FILE ]'}
      </button>
    </div>
  );
}
