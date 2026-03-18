"use client";

/**
 * Checks if the app is running in standalone mode (installed as PWA)
 */
export function isAppInstalled(): boolean {
  if (typeof window === "undefined") return false;
  
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    (window.navigator as any).standalone === true
  );
}

/**
 * Checks if the browser supports PWA installation
 */
export function isPwaSupported(): boolean {
  if (typeof window === "undefined") return false;
  
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "BeforeInstallPromptEvent" in window
  );
}