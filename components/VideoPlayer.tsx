'use client';

import { useRef, useImperativeHandle, forwardRef, useState, useEffect } from 'react';

interface VideoPlayerProps {
  src: string;
  onPlay: (time: number) => void;
  onPause: (time: number) => void;
  onSeek: (time: number) => void;
  isHost: boolean;
}

const VideoPlayer = forwardRef((props: VideoPlayerProps, ref) => {
  const { src, onPlay, onPause, onSeek, isHost } = props;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const lastSeekTimeRef = useRef(0);

  useImperativeHandle(ref, () => ({
    play: () => {
      videoRef.current?.play();
    },
    pause: () => {
      videoRef.current?.pause();
    },
    setTime: (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    },
    getCurrentTime: () => {
      return videoRef.current?.currentTime || 0;
    }
  }));

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      setIsPlaying(true);
      if (isHost) {
        onPlay(video.currentTime);
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
      if (isHost) {
        onPause(video.currentTime);
      }
    };

    const handleSeeking = () => {
      const now = Date.now();
      // 防抖：避免频繁发送 seek 事件
      if (isHost && now - lastSeekTimeRef.current > 500) {
        lastSeekTimeRef.current = now;
        onSeek(video.currentTime);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [isHost, onPlay, onPause, onSeek]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHost || !videoRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    
    videoRef.current.currentTime = newTime;
    onSeek(newTime);
  };

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full"
        controls={false}
        playsInline
        preload="metadata"
      />

      {/* Custom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        {/* Progress Bar */}
        <div 
          className="mb-3 h-1 bg-gray-600 rounded-full cursor-pointer hover:h-2 transition-all"
          onClick={handleSeekClick}
        >
          <div 
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Play/Pause */}
            {isHost ? (
              <button
                onClick={() => isPlaying ? videoRef.current?.pause() : videoRef.current?.play()}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>
            ) : (
              <span className="text-gray-400 text-sm">
                {isPlaying ? '▶️ 播放中' : '⏸️ 已暂停'}
              </span>
            )}

            {/* Time */}
            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Volume */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.muted = !videoRef.current.muted;
                }
              }}
              className="text-white hover:text-blue-400 transition-colors"
            >
              🔊
            </button>
            
            {/* Fullscreen */}
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.requestFullscreen();
                }
              }}
              className="text-white hover:text-blue-400 transition-colors"
            >
              ⛶
            </button>
          </div>
        </div>

        {!isHost && (
          <p className="mt-2 text-xs text-gray-400 text-center">
            由房主控制播放
          </p>
        )}
      </div>
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
