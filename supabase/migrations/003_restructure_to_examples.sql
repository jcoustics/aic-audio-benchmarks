-- Create examples table to group audio comparisons
CREATE TABLE public.examples (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add example_id to audio_samples and spectrograms
ALTER TABLE public.audio_samples ADD COLUMN example_id uuid REFERENCES public.examples(id) ON DELETE CASCADE;
ALTER TABLE public.spectrograms ADD COLUMN example_id uuid REFERENCES public.examples(id) ON DELETE CASCADE;

-- Drop old artifact_type enum and column (we'll use example names instead)
ALTER TABLE public.audio_samples DROP COLUMN IF EXISTS artifact_type;
ALTER TABLE public.spectrograms DROP COLUMN IF EXISTS artifact_type;

DROP TYPE IF EXISTS artifact_type;

-- Drop old unique indexes
DROP INDEX IF EXISTS audio_samples_unique_combo;
DROP INDEX IF EXISTS spectrograms_unique_combo;

-- Create new unique indexes based on example_id + version_type + competitor_name
CREATE UNIQUE INDEX audio_samples_unique_combo
  ON public.audio_samples (example_id, version_type, COALESCE(competitor_name, ''));

CREATE UNIQUE INDEX spectrograms_unique_combo
  ON public.spectrograms (example_id, version_type, COALESCE(competitor_name, ''));

-- Enable RLS on examples table
ALTER TABLE public.examples ENABLE ROW LEVEL SECURITY;

-- Policies for examples
CREATE POLICY "Examples are viewable by everyone"
  ON public.examples FOR SELECT
  USING (true);

CREATE POLICY "Examples are insertable by authenticated users"
  ON public.examples FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Examples are updatable by authenticated users"
  ON public.examples FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Examples are deletable by authenticated users"
  ON public.examples FOR DELETE
  USING (auth.role() = 'authenticated');

-- Add trigger for examples updated_at
CREATE TRIGGER set_examples_updated_at
  BEFORE UPDATE ON public.examples
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- Migrate existing data to examples
INSERT INTO public.examples (name, display_order) VALUES
  ('Distortion and Clipping', 1),
  ('Reverb and Room', 2),
  ('Strong Bandlimited Signal', 3);

-- Note: After this migration, you'll need to manually reassign audio_samples and spectrograms
-- to their respective example_id values, or they will need to be re-uploaded through the new UI
