-- Drop the old enum constraint and add competitor_name field
ALTER TABLE public.audio_samples DROP CONSTRAINT IF EXISTS audio_samples_version_type_check;
ALTER TABLE public.spectrograms DROP CONSTRAINT IF EXISTS spectrograms_version_type_check;

-- Add competitor_name column (nullable for original and aicoustics versions)
ALTER TABLE public.audio_samples ADD COLUMN IF NOT EXISTS competitor_name text;
ALTER TABLE public.spectrograms ADD COLUMN IF NOT EXISTS competitor_name text;

-- Update unique constraint to include competitor_name
ALTER TABLE public.audio_samples DROP CONSTRAINT IF EXISTS audio_samples_artifact_type_version_type_key;
ALTER TABLE public.spectrograms DROP CONSTRAINT IF EXISTS spectrograms_artifact_type_version_type_key;

-- version_type will now be: 'original', 'competitor', 'aicoustics'
DROP TYPE IF EXISTS version_type CASCADE;
CREATE TYPE version_type AS ENUM ('original', 'competitor', 'aicoustics');

-- Re-add the columns with new type (since we're changing the enum)
ALTER TABLE public.audio_samples ALTER COLUMN version_type TYPE version_type USING version_type::text::version_type;
ALTER TABLE public.spectrograms ALTER COLUMN version_type TYPE version_type USING version_type::text::version_type;

-- New unique constraint: one of each (artifact_type, version_type, competitor_name) combo
ALTER TABLE public.audio_samples ADD CONSTRAINT audio_samples_unique_combo
  UNIQUE (artifact_type, version_type, COALESCE(competitor_name, ''));

ALTER TABLE public.spectrograms ADD CONSTRAINT spectrograms_unique_combo
  UNIQUE (artifact_type, version_type, COALESCE(competitor_name, ''));
