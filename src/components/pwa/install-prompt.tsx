"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPWA() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);

  useEffect(() => {
    // Check if the app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for app installed event
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    // Show the install prompt
    await installPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await installPrompt.userChoice;
    
    if (choiceResult.outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }
    
    // Clear the saved prompt as it can't be used again
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Store in localStorage to prevent showing again for some time
    localStorage.setItem('pwaPromptDismissed', Date.now().toString());
  };

  if (isInstalled || !installPrompt || !showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 mx-auto w-11/12 max-w-md p-5 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-4">
        <div className="mr-3 bg-black rounded-lg p-2">
          <img src="/icons/icon-72x72.svg" alt="WhenFresh" className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-medium">Install WhenFresh</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">For the best experience</p>
        </div>
      </div>
      <p className="mb-4 text-sm">Install this app on your device for quick access and a better experience, even when offline.</p>
      <div className="flex gap-3">
        <Button onClick={handleDismiss} variant="outline" className="flex-1">
          Not now
        </Button>
        <Button onClick={handleInstallClick} className="flex-1">
          Install
        </Button>
      </div>
    </div>
  );
}