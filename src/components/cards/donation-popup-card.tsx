"use client";

import { useState } from "react";
import { X, Heart, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DonationPopupCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const handleDonate = () => {
    window.open('https://donate.whenfresh.com', '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Floating donation button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-40 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        aria-label="Support us"
      >
        <Heart className="h-6 w-6 fill-current text-green-500 stroke-white stroke-2" />
      </button>

      {/* Donation popup card */}
      {isOpen && (
        <div className={`fixed bottom-20 z-50 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 duration-300 transition-all ${isZoomed ? 'left-4 right-4 h-110 md:left-1/2 md:right-4 md:w-1/2 md:h-96' : 'right-4 w-80 h-96'}`}>
          {/* Zoom button */}
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="absolute top-4 left-4 z-10 text-white bg-black/50 rounded-full p-1 hover:bg-black/70 transition-colors"
          >
            <ZoomIn className="h-6 w-6 text-white" />
          </button>
          
          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 z-10 text-white bg-black/50 rounded-full p-1 hover:bg-black/70 transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
          
          {/* Pure video */}
          <video
            src="/donation.mp4"
            className="w-full h-full object-cover cursor-pointer"
            autoPlay
            loop
            muted
            playsInline
            onClick={handleDonate}
          />
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}