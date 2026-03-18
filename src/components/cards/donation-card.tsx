"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

// Types for the card data
interface CardImage {
  id: string;
  resolution: string;
  url: string;
  aspectRatio?: string | null;
  type: string;
}

interface Card {
  id: string;
  buttonText: string;
  buttonUrl: string;
  images: CardImage[];
}

// Floating button component
export default function DonationCardButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch cards from API
  useEffect(() => {
    async function fetchCards() {
      try {
        const response = await fetch('/api/cards');
        if (!response.ok) throw new Error('Failed to fetch cards');
        
        const data = await response.json();
        if (data.cards && data.cards.length > 0) {
          setCards(data.cards);
        }
      } catch (error) {
        console.error('Error fetching donation cards:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCards();
  }, []);

  // Get appropriate image based on screen size
  const getImage = (card: Card) => {
    // Default to mobile image
    let image = card.images.find(img => img.resolution === "mobile");
    
    // Check if we should use tablet or desktop image based on window width
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 1024) {
        const desktopImage = card.images.find(img => img.resolution === "desktop");
        if (desktopImage) image = desktopImage;
      } else if (window.innerWidth >= 768) {
        const tabletImage = card.images.find(img => img.resolution === "tablet");
        if (tabletImage) image = tabletImage;
      }
    }
    
    // Fallback to any image if specific resolution not found
    if (!image && card.images.length > 0) {
      image = card.images[0];
    }
    
    return image;
  };

  // Check if the media is a video
  const isVideo = (url: string) => {
    return url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg');
  };

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

  // Auto-play video when modal opens
  useEffect(() => {
    if (isModalOpen && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [isModalOpen]);

  // Don't render anything if no cards or still loading
  if (isLoading || cards.length === 0) return null;

  const currentCard = cards[currentCardIndex];
  const image = getImage(currentCard);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-40 right-4 z-40 bg-red-500 text-white rounded-full p-3 shadow-lg hover:bg-red-600 transition-colors"
        aria-label="Support us"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>

      {/* Modal using shadcn Dialog */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open);
        if (!open) {
          // Move to next card for next time
          setCurrentCardIndex((currentCardIndex + 1) % cards.length);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Support WhenFresh</DialogTitle>
            <DialogDescription>
              Help us continue our mission to connect people with fresh food.
            </DialogDescription>
          </DialogHeader>
          
          {/* Card media */}
          {image && (
            <div className="relative w-full rounded-md overflow-hidden" style={{ aspectRatio: image.aspectRatio || "16/9" }}>
              {isVideo(image.url) ? (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    src={image.url}
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
              ) : (
                <Image
                  src={image.url}
                  alt={currentCard.buttonText}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              )}
            </div>
          )}
          
          {/* Card content */}
          <div className="mt-4">
            <a 
              href={currentCard.buttonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-center rounded-md transition-colors"
            >
              {currentCard.buttonText}
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}