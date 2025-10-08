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
    <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border border-gray-100">
      <div className="relative aspect-[4/3] bg-gradient-to-br from-purple-900 via-pink-600 to-orange-500 overflow-hidden">
        {/* Spectrogram Image */}
        {hasImage && (
          <Image
            src={imagePath}
            alt={`${title} spectrogram`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
            unoptimized
          />
        )}
        {/* Audio Player Overlay */}
        {audioPath && audioPath.length > 0 && (
          <AudioPlayer audioPath={audioPath} title={title} />
        )}
      </div>
      <div className="p-5 text-center bg-gradient-to-b from-white to-gray-50">
        <h3 className="font-bold text-gray-900 text-lg tracking-tight">{title}</h3>
      </div>
    </div>
  );
}
