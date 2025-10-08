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

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
          {success}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Artifact Type
          </label>
          <select
            value={artifactType}
            onChange={(e) => setArtifactType(e.target.value as ArtifactType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {artifactTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Version Type
          </label>
          <select
            value={versionType}
            onChange={(e) => setVersionType(e.target.value as VersionType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {versionTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {type === 'audio' ? 'Audio File' : 'Spectrogram Image'}
        </label>
        <input
          id={`${type}-file-input`}
          type="file"
          onChange={handleFileChange}
          accept={type === 'audio' ? 'audio/*' : 'image/*'}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {file && (
          <p className="text-xs text-gray-500 mt-1">
            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? 'Uploading...' : 'Upload File'}
      </button>
    </div>
  );
}
