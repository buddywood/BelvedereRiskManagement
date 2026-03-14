"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioPlayerProps {
  audioUrl: string;
  duration?: number;
  questionLabel?: string;
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function AudioPlayer({ audioUrl, duration, questionLabel }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasError, setHasError] = useState(false);

  const playbackSpeeds = [0.75, 1, 1.25, 1.5];

  // Reset state when audioUrl changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setHasError(false);
    setPlaybackRate(1);
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setTotalDuration(audio.duration);
      setHasError(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setHasError(true);
      setIsPlaying(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || hasError) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      setHasError(true);
    }
  };

  const handleProgressClick = (event: React.MouseEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || hasError) return;

    const range = event.currentTarget;
    const rect = range.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    const newTime = percent * totalDuration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleProgressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || hasError) return;

    const newTime = parseFloat(event.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const cyclePlaybackSpeed = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const currentIndex = playbackSpeeds.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % playbackSpeeds.length;
    const nextSpeed = playbackSpeeds[nextIndex];

    setPlaybackRate(nextSpeed);
    audio.playbackRate = nextSpeed;
  };

  if (hasError) {
    return (
      <div className="rounded-lg bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground text-center">
          Audio unavailable
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-muted/30 p-4 space-y-3">
      {/* Hidden audio element */}
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Question label (optional) */}
      {questionLabel && (
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {questionLabel} Audio
        </p>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Play/Pause button */}
        <Button
          size="sm"
          variant="outline"
          onClick={togglePlayPause}
          className="h-8 w-8 p-0"
          disabled={hasError}
        >
          {isPlaying ? (
            <Pause className="h-3 w-3" />
          ) : (
            <Play className="h-3 w-3" />
          )}
        </Button>

        {/* Progress bar */}
        <div className="flex-1 space-y-1">
          <input
            type="range"
            min={0}
            max={totalDuration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            onClick={handleProgressClick}
            className="w-full h-1 bg-muted-foreground/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
            disabled={hasError}
          />
        </div>

        {/* Time display */}
        <div className="text-xs text-muted-foreground font-mono min-w-[80px] text-right">
          {formatTime(currentTime)} / {formatTime(totalDuration)}
        </div>

        {/* Speed control */}
        <Button
          size="sm"
          variant="ghost"
          onClick={cyclePlaybackSpeed}
          className="h-8 px-2 text-xs font-mono"
          disabled={hasError}
        >
          {playbackRate}x
        </Button>
      </div>

    </div>
  );
}