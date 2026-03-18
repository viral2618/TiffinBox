import { useState, useRef, useCallback, useEffect } from 'react';

interface UseDonationVideoOptions {
  autoPlay?: boolean;
  autoMute?: boolean;
  loop?: boolean;
}

export function useDonationVideo(options: UseDonationVideoOptions = {}) {
  const { autoPlay = false, autoMute = true, loop = true } = options;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(autoMute);
  const [isLoaded, setIsLoaded] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-play when loaded if enabled
  useEffect(() => {
    if (autoPlay && videoRef.current && isLoaded) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [autoPlay, isLoaded]);

  const play = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, []);

  const pause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const mute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  }, []);

  const unmute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      unmute();
    } else {
      mute();
    }
  }, [isMuted, mute, unmute]);

  const seek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const restart = useCallback(() => {
    seek(0);
    play();
  }, [seek, play]);

  // Video event handlers
  const handleLoadedData = useCallback(() => {
    setIsLoaded(true);
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // Video props to spread onto video element
  const videoProps = {
    ref: videoRef,
    src: '/donation.mp4',
    loop,
    muted: isMuted,
    playsInline: true,
    onLoadedData: handleLoadedData,
    onTimeUpdate: handleTimeUpdate,
    onPlay: handlePlay,
    onPause: handlePause,
  };

  return {
    // State
    isPlaying,
    isMuted,
    isLoaded,
    duration,
    currentTime,
    
    // Controls
    play,
    pause,
    togglePlay,
    mute,
    unmute,
    toggleMute,
    seek,
    restart,
    
    // Refs and props
    videoRef,
    videoProps,
  };
}