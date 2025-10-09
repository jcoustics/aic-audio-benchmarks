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
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
        <div className="relative w-full bg-black">
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
        <div className="bg-white rounded-xl shadow-md p-3">
          <AudioPlayer
            audioPath={audioPath}
            title={title}
            showPlayButton={false}
          />
        </div>
      )}

      {/* Title */}
      <h3 className="font-bold text-gray-900 text-lg text-center tracking-tight">{title}</h3>
    </div>
  );
}
