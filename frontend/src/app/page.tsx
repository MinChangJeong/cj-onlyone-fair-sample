"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { sessionToken, participant } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    console.log("Session Token:", sessionToken);

    // if (!sessionToken) {
    //   router.replace("/auth/qr");
    //   return;
    // }

    if (participant && !participant.onboardingDone) {
      router.replace("/onboarding");
      return;
    }

    router.replace("/booths");
  }, [mounted, sessionToken, participant, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">로딩 중...</p>
      </div>
    </div>
  );
}
