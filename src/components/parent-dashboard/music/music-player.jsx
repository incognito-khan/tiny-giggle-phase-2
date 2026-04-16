"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";

export function MusicPlayer({
  track,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  ownMusic = false
}) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(75);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateDuration = () => {
      const maxDuration = ownMusic ? audio.duration : Math.min(audio.duration, 30);
      setDuration(maxDuration);
    };

    const updateTime = () => {
      if (!ownMusic && audio.currentTime >= 30) {
        audio.pause();
        audio.currentTime = 30;
        if (isPlaying) {
          onPlayPause(false);
        }
      } else {
        setCurrentTime(audio.currentTime);
      }
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, [onPlayPause]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;

    if (isPlaying) {
      audio.play().catch(console.error);
    }
  }, [track]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume / 100;
    }
  }, [volume]);

  const handleSeek = (value) => {
    const audio = audioRef.current;
    if (audio && duration) {
      const newTime = (value[0] / 100) * duration;
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50">
      <audio ref={audioRef} src={track?.url} preload="metadata" />

      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center gap-4">
          {/* Track Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
              <img
                src={track?.thumbnail || "/placeholder.svg"}
                alt={`${track?.title} album cover`}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <h4 className="font-medium text-foreground truncate">
                {track?.title}
              </h4>
              <p className="text-sm text-muted-foreground truncate">
                {track?.uploadedBy?.name}
              </p>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex flex-col items-center gap-2 flex-1 max-w-md">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onPrevious}
                className="text-muted-foreground hover:text-foreground"
              >
                <SkipBack className="w-4 h-4" />
              </Button>

              <Button
                size="sm"
                onClick={onPlayPause}
                className="rounded-full w-10 h-10 bg-pink-600 hover:bg-pink-600/90 text-primary-foreground"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onNext}
                className="text-muted-foreground hover:text-foreground"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-2 w-full">
              <span className="text-xs text-muted-foreground min-w-[35px]">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[progress]}
                onValueChange={handleSeek}
                max={100}
                step={0.1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground min-w-[35px]">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={[volume]}
              onValueChange={(value) => setVolume(value[0])}
              max={100}
              step={1}
              className="w-24"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
