"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import type { AuthResponse } from "@/types";
import { Loader2, QrCode } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

function QRAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const setSession = useAuthStore((s) => s.setSession);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    const authenticate = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await api.post<AuthResponse>("/api/v1/auth/qr", {
          qrToken: token,
        });

        setSession(data.sessionToken, {
          id: 0,
          displayName: data.displayName,
          role: data.role,
          onboardingDone: data.onboardingDone,
        });

        if (!data.onboardingDone) {
          router.replace("/onboarding");
        } else {
          router.replace("/booths");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "인증 처리 중 오류가 발생했습니다. QR 코드를 다시 스캔해주세요."
        );
      } finally {
        setLoading(false);
      }
    };

    authenticate();
  }, [token, setSession, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">인증 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <div className="w-full max-w-[400px]">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-6 py-8">
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-primary/10">
                <QrCode className="h-12 w-12 text-primary" />
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold">CJ ONLYONE FAIR</h2>
                <p className="text-base text-muted-foreground">
                  QR 코드를 스캔해주세요
                </p>
              </div>

              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                행사장에서 제공된 QR 코드를 스캔하면
                <br />
                자동으로 로그인됩니다.
              </p>

              {error && (
                <div className="w-full p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
                  {error}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function QRAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <QRAuthContent />
    </Suspense>
  );
}
