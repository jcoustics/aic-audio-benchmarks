import SpectrogramCard from "@/components/SpectrogramCard";
import { createClient } from "@/lib/supabase/server";
import type { AudioSample, Spectrogram, Example } from "@/lib/types/database";
import Image from "next/image";

export const revalidate = 0; // Disable caching for real-time updates

export default async function Home() {
  const supabase = await createClient();

  // Fetch page settings, examples, audio samples, and spectrograms from Supabase
  const { data: pageSettings } = await supabase
    .from('page_settings')
    .select('*')
    .limit(1)
    .single();

  const { data: examples } = await supabase
    .from('examples')
    .select('*')
    .order('display_order', { ascending: true });

  const { data: audioSamples } = await supabase
    .from('audio_samples')
    .select('*');

  const { data: spectrograms } = await supabase
    .from('spectrograms')
    .select('*');

  // Helper functions to get data for a specific example
  const getAudioUrl = (exampleId: string, version: string) => {
    const sample = audioSamples?.find(
      (s: AudioSample) => s.example_id === exampleId && s.version_type === version
    );
    return sample?.file_url || '';
  };

  const getSpectrogramUrl = (exampleId: string, version: string) => {
    const spec = spectrograms?.find(
      (s: Spectrogram) => s.example_id === exampleId && s.version_type === version
    );
    return spec?.image_url || '';
  };

  // Get competitor name for display
  const getCompetitorName = (exampleId: string) => {
    const sample = audioSamples?.find(
      (s: AudioSample) => s.example_id === exampleId && s.version_type === 'competitor'
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
      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-16">
        {/* Title */}
        <div className="text-center mb-10 md:mb-12">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-light tracking-tight">
            {pageSettings?.page_title || 'Subtractive vs. Generative'}
          </h1>
        </div>

        {/* Explanation Text */}
        <div className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-sm mb-16 md:mb-16 max-w-5xl mx-auto border border-white/50">
          <p className="text-sm md:text-base leading-relaxed text-gray-800 text-center">
            {pageSettings?.page_description || 'These spectrograms show the time-frequency representations of audio signals...'}
          </p>
        </div>

        {/* Dynamic Example Sections */}
        {examples && examples.length > 0 ? (
          examples.map((example: Example) => (
            <section key={example.id} className="mb-20 md:mb-20">
              <h2 className="text-xl md:text-2xl font-bold mb-10 md:mb-10 tracking-tight">{example.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
                <SpectrogramCard
                  title="Original"
                  imagePath={getSpectrogramUrl(example.id, 'original')}
                  audioPath={getAudioUrl(example.id, 'original')}
                />
                <SpectrogramCard
                  title={getCompetitorName(example.id)}
                  imagePath={getSpectrogramUrl(example.id, 'competitor')}
                  audioPath={getAudioUrl(example.id, 'competitor')}
                />
                <SpectrogramCard
                  title="ai-coustics"
                  imagePath={getSpectrogramUrl(example.id, 'aicoustics')}
                  audioPath={getAudioUrl(example.id, 'aicoustics')}
                />
              </div>
            </section>
          ))
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500">No examples available yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}
