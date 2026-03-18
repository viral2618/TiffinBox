"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, Volume2, VolumeX, Heart } from "lucide-react";

interface DonationVideoSectionProps {
  title?: string;
  description?: string;
  buttonText?: string;
  donationUrl?: string;
  autoPlay?: boolean;
  className?: string;
}

export function DonationVideoSection({
  title = "Support WhenFresh",
  description = "Help us continue connecting people with fresh, local food. Your donation makes a difference in building stronger communities.",
  buttonText = "Donate Now",
  donationUrl = "https://donate.whenfresh.com",
  autoPlay = false,
  className = ""
}: DonationVideoSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (autoPlay && videoRef.current && isLoaded) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [autoPlay, isLoaded]);

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
    window.open(donationUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className={`py-12 ${className}`}>
      <div className="container mx-auto px-4">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Video */}
              <div className="relative aspect-video lg:aspect-square">
                <video
                  ref={videoRef}
                  src="/donation.mp4"
                  className="w-full h-full object-cover"
                  loop
                  muted={isMuted}
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onLoadedData={() => setIsLoaded(true)}
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

                {/* Play button overlay when paused */}
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={togglePlay}
                      className="bg-white/90 hover:bg-white shadow-lg"
                    >
                      <Play className="h-6 w-6 ml-1" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-8 flex flex-col justify-center">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-4">{title}</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {description}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Button
                      onClick={handleDonate}
                      size="lg"
                      className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white"
                    >
                      <Heart className="h-4 w-4 mr-2 fill-current" />
                      {buttonText}
                    </Button>
                    
                    <div className="text-sm text-muted-foreground">
                      <p>🌱 Every donation helps local communities</p>
                      <p>🤝 100% goes to supporting fresh food access</p>
                      <p>💚 Tax-deductible contributions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}