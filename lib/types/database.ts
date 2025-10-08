export type ArtifactType = 'distortion' | 'reverb' | 'bandlimit';
export type VersionType = 'original' | 'subtractive' | 'generative';

export interface AudioSample {
  id: string;
  artifact_type: ArtifactType;
  version_type: VersionType;
  file_url: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
  updated_at: string;
}

export interface Spectrogram {
  id: string;
  artifact_type: ArtifactType;
  version_type: VersionType;
  image_url: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      audio_samples: {
        Row: AudioSample;
        Insert: Omit<AudioSample, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AudioSample, 'id' | 'created_at' | 'updated_at'>>;
      };
      spectrograms: {
        Row: Spectrogram;
        Insert: Omit<Spectrogram, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Spectrogram, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}
