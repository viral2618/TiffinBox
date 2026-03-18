"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Play, Pause, Volume2, VolumeX } from "lucide-react";

interface DonationHeroBannerProps {
  className?: string;
}

export function DonationHeroBanner({ className = "" }: DonationHeroBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-play video when component mounts
  useEffect(() => {
    if (videoRef.current && isVisible) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [isVisible]);

  // Video control handlers
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleDonate = () => {
    window.open('https://donate.whenfresh.com', '_blank', 'noopener,noreferrer');
  };

  if (!isVisible) return null;

  return (
    <div className={`relative w-full bg-gradient-to-r from-blue-600 to-purple-600 ${className}`}>
      {/* Close button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 z-10 text-white hover:bg-white/20"
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Content */}
          <div className="text-white space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Support WhenFresh
            </h2>
            <p className="text-lg opacity-90">
              Help us continue connecting people with fresh, local food. Your donation makes a difference in building stronger communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleDonate}
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Donate Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10"
                onClick={() => window.open('/about', '_blank')}
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Video */}
          <div className="relative">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-2xl">
              <video
                ref={videoRef}
                src="/donation.mp4"
                className="w-full h-full object-cover"
                loop
                muted={isMuted}
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Video controls overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={togglePlay}
                    className="bg-white/80 hover:bg-white/90"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={toggleMute}
                    className="bg-white/80 hover:bg-white/90"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}