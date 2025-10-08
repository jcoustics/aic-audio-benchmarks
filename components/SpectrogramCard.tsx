'use client';

import Image from 'next/image';
import AudioPlayer from './AudioPlayer';

interface SpectrogramCardProps {
  title: string;
  imagePath: string;
  audioPath: string;
}

export default function SpectrogramCard({ title, imagePath, audioPath }: SpectrogramCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div className="relative aspect-[4/3] bg-gradient-to-br from-purple-900 via-pink-600 to-orange-500">
        {/* Spectrogram Image */}
        <Image
          src={imagePath}
          alt={`${title} spectrogram`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
        />
        {/* Audio Player Overlay */}
        <AudioPlayer audioPath={audioPath} title={title} />
      </div>
      <div className="p-4 text-center">
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
    </div>
  );
}
