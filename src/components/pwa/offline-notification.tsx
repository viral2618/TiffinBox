"use client";

import { useOnlineStatus } from "@/hooks/use-online-status";

export default function OfflineNotification() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black p-2 text-center text-sm z-50">
      You are currently offline. Some features may be limited.
    </div>
  );
}