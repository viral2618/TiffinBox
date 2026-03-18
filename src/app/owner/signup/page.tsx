"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OwnerSignupPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/owner/auth");
  }, [router]);

  return null;
}