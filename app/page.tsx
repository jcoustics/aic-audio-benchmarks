import SpectrogramCard from "@/components/SpectrogramCard";
import { createClient } from "@/lib/supabase/server";
import type { AudioSample, Spectrogram } from "@/lib/types/database";
import Image from "next/image";

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

  // Get competitor name for display
  const getCompetitorName = (artifact: string) => {
    const sample = audioSamples?.find(
      (s: AudioSample) => s.artifact_type === artifact && s.version_type === 'competitor'
    );
    return sample?.competitor_name || 'Competitor';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f4f8] via-white to-[#f0f8ff]">
      {/* Header */}
      <header className="py-3 md:py-4 px-4 md:px-8 border-b border-black/5 bg-white/50 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto flex justify-center items-center">
          <div className="relative h-8 md:h-10 w-auto">
            <Image
              src="/logos/aicoustics-wordmark-black.svg"
              alt="ai-coustics"
              width={200}
              height={40}
              className="object-contain h-full w-auto"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-16">
        {/* Title */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">Subtractive vs. Generative</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-orange-500 mx-auto rounded-full"></div>
        </div>

        {/* Explanation Text */}
        <div className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-lg mb-12 md:mb-16 max-w-5xl mx-auto border border-white/50">
          <p className="text-sm md:text-base leading-relaxed text-gray-800 text-center">
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
        <section className="mb-12 md:mb-20">
          <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 tracking-tight">Distortion and Clipping</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <SpectrogramCard
              title="Original"
              imagePath={getSpectrogramUrl('distortion', 'original')}
              audioPath={getAudioUrl('distortion', 'original')}
            />
            <SpectrogramCard
              title={getCompetitorName('distortion')}
              imagePath={getSpectrogramUrl('distortion', 'competitor')}
              audioPath={getAudioUrl('distortion', 'competitor')}
            />
            <SpectrogramCard
              title="ai-coustics"
              imagePath={getSpectrogramUrl('distortion', 'aicoustics')}
              audioPath={getAudioUrl('distortion', 'aicoustics')}
            />
          </div>
        </section>

        {/* Reverb and Room Section */}
        <section className="mb-12 md:mb-20">
          <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 tracking-tight">Reverb and Room</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <SpectrogramCard
              title="Original"
              imagePath={getSpectrogramUrl('reverb', 'original')}
              audioPath={getAudioUrl('reverb', 'original')}
            />
            <SpectrogramCard
              title={getCompetitorName('reverb')}
              imagePath={getSpectrogramUrl('reverb', 'competitor')}
              audioPath={getAudioUrl('reverb', 'competitor')}
            />
            <SpectrogramCard
              title="ai-coustics"
              imagePath={getSpectrogramUrl('reverb', 'aicoustics')}
              audioPath={getAudioUrl('reverb', 'aicoustics')}
            />
          </div>
        </section>

        {/* Strong Bandlimited Signal Section */}
        <section className="mb-12 md:mb-20">
          <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 tracking-tight">Strong Bandlimited Signal</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <SpectrogramCard
              title="Original"
              imagePath={getSpectrogramUrl('bandlimit', 'original')}
              audioPath={getAudioUrl('bandlimit', 'original')}
            />
            <SpectrogramCard
              title={getCompetitorName('bandlimit')}
              imagePath={getSpectrogramUrl('bandlimit', 'competitor')}
              audioPath={getAudioUrl('bandlimit', 'competitor')}
            />
            <SpectrogramCard
              title="ai-coustics"
              imagePath={getSpectrogramUrl('bandlimit', 'aicoustics')}
              audioPath={getAudioUrl('bandlimit', 'aicoustics')}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
