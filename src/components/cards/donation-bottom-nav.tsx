"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Heart } from "lucide-react";

export function DonationBottomNav() {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-play video when expanded
  useEffect(() => {
    if (isExpanded && videoRef.current) {
      videoRef.current.play();
    }
  }, [isExpanded]);

  const handleDonate = () => {
    window.open('https://donate.whenfresh.com', '_blank', 'noopener,noreferrer');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg">
      {/* Expanded view */}
      {isExpanded && (
        <div className="p-4 border-b">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-lg">Support WhenFresh</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Help us connect communities with fresh, local food
              </p>
              <Button onClick={handleDonate} className="w-full">
                Donate Now
              </Button>
            </div>
            
            <div className="relative aspect-video rounded-md overflow-hidden">
              <video
                ref={videoRef}
                src="/donation.mp4"
                className="w-full h-full object-cover"
                loop
                muted
                playsInline
              />
            </div>
          </div>
        </div>
      )}

      {/* Compact view */}
      <div className="flex items-center justify-between p-3">
        <div 
          className="flex items-center gap-3 flex-1 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="relative w-12 h-8 rounded overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500">
            <video
              src="/donation.mp4"
              className="w-full h-full object-cover"
              muted
              playsInline
              autoPlay
              loop
            />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Support WhenFresh</p>
            <p className="text-xs text-muted-foreground">Tap to learn more</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleDonate}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <Heart className="h-4 w-4 mr-1 fill-current" />
            Donate
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}