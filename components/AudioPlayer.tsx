'use client';

import { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  audioPath: string;
  title: string;
  showPlayButton?: boolean;
  showProgressBar?: boolean;
}

export default function AudioPlayer({
  audioPath,
  title,
  showPlayButton = true,
  showProgressBar = true
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
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

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <audio ref={audioRef} src={audioPath} preload="metadata" />

      {/* Play/Pause Button */}
      {showPlayButton && (
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
      )}

      {/* Progress Bar */}
      {showProgressBar && (
        <div className={showPlayButton ? "absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm p-3" : ""}>
          <div className="flex items-center gap-3">
            {!showPlayButton && (
              <button
                onClick={togglePlay}
                className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors flex-shrink-0"
                aria-label={`${isPlaying ? 'Pause' : 'Play'} ${title} audio`}
              >
                {isPlaying ? (
                  // Pause icon
                  <div className="flex gap-0.5">
                    <div className="w-0.5 h-3 bg-white rounded-full"></div>
                    <div className="w-0.5 h-3 bg-white rounded-full"></div>
                  </div>
                ) : (
                  // Play icon
                  <div className="w-0 h-0 border-l-[10px] border-l-white border-y-[6px] border-y-transparent ml-0.5"></div>
                )}
              </button>
            )}
            <span className={`text-xs font-mono min-w-[35px] ${showPlayButton ? 'text-white' : 'text-gray-600'}`}>
              {formatTime(currentTime)}
            </span>
            <div
              onClick={handleSeek}
              className="flex-1 h-2 bg-gray-200 rounded-full cursor-pointer group/progress hover:h-3 transition-all"
            >
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-orange-500 rounded-full relative transition-all"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"></div>
              </div>
            </div>
            <span className={`text-xs font-mono min-w-[35px] ${showPlayButton ? 'text-white' : 'text-gray-600'}`}>
              {formatTime(duration)}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
