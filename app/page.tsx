import SpectrogramCard from "@/components/SpectrogramCard";
import { createClient } from "@/lib/supabase/server";
import type { AudioSample, Spectrogram } from "@/lib/types/database";

export const revalidate = 0; // Disable caching for real-time updates

export default async function Home() {
  const supabase = await createClient();

  // Fetch audio samples and spectrograms from Supabase
  const { data: audioSamples } = await supabase
    .from('audio_samples')
    .select('*');

  const { data: spectrograms } = await supabase
    .from('spectrograms')
    .select('*');

  // Helper function to find URL by artifact and version type
  const getAudioUrl = (artifact: string, version: string) => {
    const sample = audioSamples?.find(
      (s: AudioSample) => s.artifact_type === artifact && s.version_type === version
    );
    return sample?.file_url || `/audio/${artifact}-${version}.wav`;
  };

  const getSpectrogramUrl = (artifact: string, version: string) => {
    const spec = spectrograms?.find(
      (s: Spectrogram) => s.artifact_type === artifact && s.version_type === version
    );
    return spec?.image_url || `/spectrograms/${artifact}-${version}.png`;
  };

  return (
    <div className="min-h-screen bg-[#f5d4d4]">
      {/* Header */}
      <header className="py-8 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">ai</span>
            <span className="text-2xl font-light">|coustics</span>
            <span className="text-xs text-gray-600 ml-2">GENERATIVE AUDIO AI</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-12">
        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-8">Subtractive vs. Generative</h1>

        {/* Explanation Text */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-12 max-w-4xl mx-auto">
          <p className="text-sm leading-relaxed text-gray-800">
            These spectrograms show the time-frequency representations of audio signals, highlighting how different
            audio artifacts manifest visually. Distortion adds excessive energy to certain frequencies (visible as
            bright spots), codec artifacts cause small gaps in the frequency response (visible as vertical gaps
            causing small gaps), reverb blurs the signal, and bandlimiting results in a complete loss of information in
            specific frequency ranges. While current subtractive AI models have limited capabilities in addressing these
            issues, our approach goes further: we reconstruct the missing information to deliver a studio-quality voice
            recording.
          </p>
        </div>

        {/* Distortion and Clipping Section */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold mb-6">Distortion and Clipping</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SpectrogramCard
              title="Original"
              imagePath={getSpectrogramUrl('distortion', 'original')}
              audioPath={getAudioUrl('distortion', 'original')}
            />
            <SpectrogramCard
              title="Subtractive (Dolby.io)"
              imagePath={getSpectrogramUrl('distortion', 'subtractive')}
              audioPath={getAudioUrl('distortion', 'subtractive')}
            />
            <SpectrogramCard
              title="Generative (aicoustics)"
              imagePath={getSpectrogramUrl('distortion', 'generative')}
              audioPath={getAudioUrl('distortion', 'generative')}
            />
          </div>
        </section>

        {/* Reverb and Room Section */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold mb-6">Reverb and Room</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SpectrogramCard
              title="Original"
              imagePath={getSpectrogramUrl('reverb', 'original')}
              audioPath={getAudioUrl('reverb', 'original')}
            />
            <SpectrogramCard
              title="Subtractive (Dolby.io)"
              imagePath={getSpectrogramUrl('reverb', 'subtractive')}
              audioPath={getAudioUrl('reverb', 'subtractive')}
            />
            <SpectrogramCard
              title="Generative (aicoustics)"
              imagePath={getSpectrogramUrl('reverb', 'generative')}
              audioPath={getAudioUrl('reverb', 'generative')}
            />
          </div>
        </section>

        {/* Strong Bandlimited Signal Section */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold mb-6">Strong Bandlimited Signal</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SpectrogramCard
              title="Original"
              imagePath={getSpectrogramUrl('bandlimit', 'original')}
              audioPath={getAudioUrl('bandlimit', 'original')}
            />
            <SpectrogramCard
              title="Subtractive (Dolby.io)"
              imagePath={getSpectrogramUrl('bandlimit', 'subtractive')}
              audioPath={getAudioUrl('bandlimit', 'subtractive')}
            />
            <SpectrogramCard
              title="Generative (aicoustics)"
              imagePath={getSpectrogramUrl('bandlimit', 'generative')}
              audioPath={getAudioUrl('bandlimit', 'generative')}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
