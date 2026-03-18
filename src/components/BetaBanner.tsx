'use client';

import { useState, useEffect } from 'react';

export default function BetaBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const dismissedAt = localStorage.getItem("beta-banner-dismissed");
    
    if (dismissedAt) {
      const dismissTime = parseInt(dismissedAt);
      const twentyFourHours = 24 * 60 * 60 * 1000;
      const now = Date.now();
      
      if (now - dismissTime < twentyFourHours) {
        setIsVisible(false);
        setIsLoaded(true);
        return;
      }
    }
    
    setIsVisible(true);
    setIsLoaded(true);
  }, []);

  if (!isLoaded || !isVisible) return null;

  return (
    <div className="border-b border-yellow-200 bg-yellow-50 text-yellow-900 px-4 py-2 text-sm relative z-50 fixed top-0 left-0 right-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-yellow-300 bg-yellow-100 px-2 py-0.5 text-xs font-semibold">
            BETA
          </span>
          <span className="text-sm">
            This is a beta version. Some features may be unstable.
          </span>
          <a
            href="/faqs"
            className="text-yellow-800 underline underline-offset-2 hover:no-underline"
          >
            Know more
          </a>
        </div>

        <button
          onClick={() => {
            localStorage.setItem("beta-banner-dismissed", Date.now().toString());
            setIsVisible(false);
          }}
          className="text-yellow-700 hover:text-yellow-900"
        >
          ✕
        </button>
      </div>
    </div>
  );
}