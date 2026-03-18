"use client";

import dynamic from "next/dynamic";

const InstallPWA = dynamic(() => import("./install-prompt"), {
  ssr: false,
});

const OfflineNotification = dynamic(() => import("./offline-notification"), {
  ssr: false,
});

export default function PWAProvider() {
  return (
    <>
      <OfflineNotification />
      <InstallPWA />
    </>
  );
}