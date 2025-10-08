-- Step 1: Add competitor_name column
ALTER TABLE public.audio_samples ADD COLUMN IF NOT EXISTS competitor_name text;
ALTER TABLE public.spectrograms ADD COLUMN IF NOT EXISTS competitor_name text;

-- Step 2: Drop the old unique constraints
ALTER TABLE public.audio_samples DROP CONSTRAINT IF EXISTS audio_samples_artifact_type_version_type_key;
ALTER TABLE public.spectrograms DROP CONSTRAINT IF EXISTS spectrograms_artifact_type_version_type_key;

-- Step 3: Create new enum type with new values
CREATE TYPE version_type_new AS ENUM ('original', 'competitor', 'aicoustics');

-- Step 4: Add temporary columns with new type
ALTER TABLE public.audio_samples ADD COLUMN version_type_new version_type_new;
ALTER TABLE public.spectrograms ADD COLUMN version_type_new version_type_new;

-- Step 5: Migrate data (map old values to new values)
UPDATE public.audio_samples
SET version_type_new = CASE
  WHEN version_type::text = 'original' THEN 'original'::version_type_new
  WHEN version_type::text = 'subtractive' THEN 'competitor'::version_type_new
  WHEN version_type::text = 'generative' THEN 'aicoustics'::version_type_new
END;

UPDATE public.spectrograms
SET version_type_new = CASE
  WHEN version_type::text = 'original' THEN 'original'::version_type_new
  WHEN version_type::text = 'subtractive' THEN 'competitor'::version_type_new
  WHEN version_type::text = 'generative' THEN 'aicoustics'::version_type_new
END;

-- Step 6: Drop old columns and rename new ones
ALTER TABLE public.audio_samples DROP COLUMN version_type;
ALTER TABLE public.spectrograms DROP COLUMN version_type;

ALTER TABLE public.audio_samples RENAME COLUMN version_type_new TO version_type;
ALTER TABLE public.spectrograms RENAME COLUMN version_type_new TO version_type;

-- Step 7: Drop old enum type
DROP TYPE IF EXISTS version_type;

-- Step 8: Rename new enum type
ALTER TYPE version_type_new RENAME TO version_type;

-- Step 9: Make version_type NOT NULL
ALTER TABLE public.audio_samples ALTER COLUMN version_type SET NOT NULL;
ALTER TABLE public.spectrograms ALTER COLUMN version_type SET NOT NULL;

-- Step 10: Create unique indexes that handle NULL competitor_name properly
CREATE UNIQUE INDEX audio_samples_unique_combo
  ON public.audio_samples (artifact_type, version_type, competitor_name);

CREATE UNIQUE INDEX spectrograms_unique_combo
  ON public.spectrograms (artifact_type, version_type, competitor_name);
