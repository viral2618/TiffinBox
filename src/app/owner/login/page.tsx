"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OwnerLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/owner/auth");
  }, [router]);

  return null;
}