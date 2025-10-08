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
        className="absolute inset-0 flex items-center justify-center group hover:bg-black/20 transition-colors"
        aria-label={`${isPlaying ? 'Pause' : 'Play'} ${title} audio`}
      >
        <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center group-hover:bg-black/70 transition-colors">
          {isPlaying ? (
            // Pause icon
            <div className="flex gap-1">
              <div className="w-1 h-4 bg-white"></div>
              <div className="w-1 h-4 bg-white"></div>
            </div>
          ) : (
            // Play icon
            <div className="w-0 h-0 border-l-[16px] border-l-white border-y-[10px] border-y-transparent ml-1"></div>
          )}
        </div>
      </button>
    </>
  );
}
