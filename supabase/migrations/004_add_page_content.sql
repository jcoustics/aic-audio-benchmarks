-- Add page title and description fields to a new settings table
CREATE TABLE public.page_settings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  page_title text NOT NULL DEFAULT 'Subtractive vs. Generative',
  page_description text NOT NULL DEFAULT 'These spectrograms show the time-frequency representations of audio signals, highlighting how different audio artifacts manifest visually. Distortion adds excessive energy to certain frequencies (visible as bright spots), codec artifacts cause small gaps in the frequency response (visible as vertical gaps causing small gaps), reverb blurs the signal, and bandlimiting results in a complete loss of information in specific frequency ranges. While current subtractive AI models have limited capabilities in addressing these issues, our approach goes further: we reconstruct the missing information to deliver a studio-quality voice recording.',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default settings
INSERT INTO public.page_settings (page_title, page_description) VALUES
  ('Subtractive vs. Generative', 'These spectrograms show the time-frequency representations of audio signals, highlighting how different audio artifacts manifest visually. Distortion adds excessive energy to certain frequencies (visible as bright spots), codec artifacts cause small gaps in the frequency response (visible as vertical gaps causing small gaps), reverb blurs the signal, and bandlimiting results in a complete loss of information in specific frequency ranges. While current subtractive AI models have limited capabilities in addressing these issues, our approach goes further: we reconstruct the missing information to deliver a studio-quality voice recording.');

-- Enable RLS
ALTER TABLE public.page_settings ENABLE ROW LEVEL SECURITY;

-- Policies for page_settings
CREATE POLICY "Page settings are viewable by everyone"
  ON public.page_settings FOR SELECT
  USING (true);

CREATE POLICY "Page settings are updatable by authenticated users"
  ON public.page_settings FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Add trigger for updated_at
CREATE TRIGGER set_page_settings_updated_at
  BEFORE UPDATE ON public.page_settings
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();
