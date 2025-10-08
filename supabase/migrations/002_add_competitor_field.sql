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

-- Create unique indexes that treat NULL as a distinct value
-- This allows multiple rows with the same artifact_type/version_type if competitor_name is NULL
-- But only one row for each unique combination when competitor_name is specified
CREATE UNIQUE INDEX audio_samples_unique_combo
  ON public.audio_samples (artifact_type, version_type, competitor_name);

CREATE UNIQUE INDEX spectrograms_unique_combo
  ON public.spectrograms (artifact_type, version_type, competitor_name);
