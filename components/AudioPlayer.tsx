'use client';

import { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  audioPath: string;
  title: string;
}

export default function AudioPlayer({ audioPath, title }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  return (
    <>
      <audio ref={audioRef} src={audioPath} preload="metadata" />
      <button
        onClick={togglePlay}
        className="absolute inset-0 flex items-center justify-center group/player hover:bg-black/10 transition-all duration-300"
        aria-label={`${isPlaying ? 'Pause' : 'Play'} ${title} audio`}
      >
        <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center group-hover/player:bg-white group-hover/player:scale-110 transition-all duration-300 shadow-xl">
          {isPlaying ? (
            // Pause icon
            <div className="flex gap-1.5">
              <div className="w-1.5 h-5 bg-gray-900 rounded-full"></div>
              <div className="w-1.5 h-5 bg-gray-900 rounded-full"></div>
            </div>
          ) : (
            // Play icon
            <div className="w-0 h-0 border-l-[18px] border-l-gray-900 border-y-[12px] border-y-transparent ml-1"></div>
          )}
        </div>
      </button>
    </>
  );
}
