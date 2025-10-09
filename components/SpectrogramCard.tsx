'use client';

import Image from 'next/image';
import AudioPlayer from './AudioPlayer';

interface SpectrogramCardProps {
  title: string;
  imagePath: string;
  audioPath: string;
}

export default function SpectrogramCard({ title, imagePath, audioPath }: SpectrogramCardProps) {
  // If no image path, still show the card with gradient
  const hasImage = imagePath && imagePath.length > 0;

  return (
    <div className="group space-y-4">
      {/* Spectrogram Image (no play button) */}
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] hover:shadow-sm transition-all duration-300">
        <div className="relative w-full bg-white p-4">
          {/* Spectrogram Image */}
          {hasImage && (
            <Image
              src={imagePath}
              alt={`${title} spectrogram`}
              width={800}
              height={400}
              className="w-full h-auto"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
              unoptimized
            />
          )}
        </div>
      </div>

      {/* Audio Player Bar */}
      {audioPath && audioPath.length > 0 && (
        <div className="bg-white rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] p-3">
          <AudioPlayer
            audioPath={audioPath}
            title={title}
            showPlayButton={false}
          />
        </div>
      )}

      {/* Title */}
      <h3 className="font-light text-gray-900 text-lg text-center tracking-tight">{title}</h3>
    </div>
  );
}
