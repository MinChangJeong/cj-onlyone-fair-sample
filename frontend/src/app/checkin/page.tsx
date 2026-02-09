"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import type { CheckInItem } from "@/types";
import MobileShell from "@/components/layout/MobileShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Keyboard, Loader2, CheckCircle2 } from "lucide-react";

export default function CheckInPage() {
  useRequireAuth();
  const router = useRouter();

  const [boothCode, setBoothCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<CheckInItem | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html5QrCodeRef = useRef<any>(null);

  // Cleanup QR scanner on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleCheckInSuccess = useCallback(
    (checkIn: CheckInItem) => {
      setSuccess(checkIn);
      setError(null);
      setTimeout(() => {
        router.push(`/booths/${checkIn.boothId}`);
      }, 1500);
    },
    [router]
  );

  const startQrScanner = useCallback(async () => {
    if (!scannerRef.current) return;

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          try {
            await scanner.stop();
            html5QrCodeRef.current = null;

            setLoading(true);
            const checkIn = await api.post<CheckInItem>(
              "/api/v1/checkins/qr",
              { qrToken: decodedText }
            );
            handleCheckInSuccess(checkIn);
          } catch (err) {
            setError(
              err instanceof Error
                ? err.message
                : "체크인 처리 중 오류가 발생했습니다."
            );
            setLoading(false);
          }
        },
        () => {
          // QR code scan error (no QR found in frame) - ignore
        }
      );
    } catch {
      setError("카메라를 사용할 수 없습니다. 코드 입력을 이용해주세요.");
    }
  }, [handleCheckInSuccess]);

  const stopQrScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch {
        // Ignore stop errors
      }
      html5QrCodeRef.current = null;
    }
  }, []);

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (boothCode.length !== 4) return;

    setLoading(true);
    setError(null);

    try {
      const checkIn = await api.post<CheckInItem>("/api/v1/checkins/code", {
        boothCode: boothCode.toUpperCase(),
      });
      handleCheckInSuccess(checkIn);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "체크인 처리 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <MobileShell>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <h2 className="text-lg font-bold">체크인 완료!</h2>
            <p className="text-sm text-muted-foreground">
              {success.boothName} 부스에 체크인했습니다.
            </p>
            <p className="text-xs text-muted-foreground">
              부스 페이지로 이동합니다...
            </p>
          </div>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-bold">부스 체크인</h2>

        <Tabs
          defaultValue="qr"
          onValueChange={(value) => {
            setError(null);
            if (value === "qr") {
              startQrScanner();
            } else {
              stopQrScanner();
            }
          }}
          className="w-full"
        >
          <TabsList className="w-full">
            <TabsTrigger value="qr" className="flex-1 gap-1.5">
              <Camera className="h-4 w-4" />
              QR 스캔
            </TabsTrigger>
            <TabsTrigger value="code" className="flex-1 gap-1.5">
              <Keyboard className="h-4 w-4" />
              코드 입력
            </TabsTrigger>
          </TabsList>

          <TabsContent value="qr">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div
                  id="qr-reader"
                  ref={scannerRef}
                  className="w-full rounded-lg overflow-hidden"
                />
                <p className="text-xs text-muted-foreground text-center">
                  부스의 QR 코드를 카메라에 비춰주세요.
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  QR이 잘 안 되나요? 부스 코드를 입력해 주세요.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="code">
            <Card>
              <CardContent className="p-4">
                <form onSubmit={handleCodeSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">부스 코드</label>
                    <Input
                      placeholder="4자리 코드 입력 (예: AB12)"
                      value={boothCode}
                      onChange={(e) =>
                        setBoothCode(e.target.value.toUpperCase().slice(0, 4))
                      }
                      className="text-center text-lg tracking-widest font-mono uppercase"
                      maxLength={4}
                      autoComplete="off"
                    />
                    <p className="text-xs text-muted-foreground">
                      QR이 잘 안 되나요? 부스 코드를 입력해 주세요.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={boothCode.length !== 4 || loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        처리 중...
                      </>
                    ) : (
                      "체크인"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </MobileShell>
  );
}
