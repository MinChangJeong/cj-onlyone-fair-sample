"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const slides = [
  {
    text: "모든 성공적인 비즈니스는\n수십 번의 잘못된 가정에서\n시작되었습니다.",
    emoji: "💡",
  },
  {
    text: "CJ의 히트 상품들도\n한때는 실패한 실험이었습니다.",
    emoji: "🔬",
  },
  {
    text: "오늘의 시행착오가\n내일의 인사이트가 됩니다.",
    emoji: "🌱",
  },
];

const closingMessage =
  "당신은 실패를 공유하는 것이 아닙니다.\n당신의 배움의 여정을 공유하는 것입니다.";

export default function OnboardingPage() {
  const router = useRouter();
  const { participant, updateOnboardingDone } = useAuthStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [canProceed, setCanProceed] = useState(false);
  const [showClosing, setShowClosing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!participant) {
      router.replace("/auth/qr");
      return;
    }
    if (participant.onboardingDone) {
      router.replace("/booths");
    }
  }, [participant, router]);

  useEffect(() => {
    if (currentSlide === 0) {
      setCanProceed(false);
      const timer = setTimeout(() => {
        setCanProceed(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setCanProceed(true);
    }
  }, [currentSlide]);

  const handleNext = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      setShowClosing(true);
    }
  }, [currentSlide]);

  const handleStart = async () => {
    setSubmitting(true);
    try {
      await api.post("/api/v1/auth/onboarding-complete");
      updateOnboardingDone();
      router.replace("/booths");
    } catch {
      setSubmitting(false);
    }
  };

  // Swipe handling
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (diff > 50 && canProceed && !showClosing) {
      handleNext();
    }
    setTouchStart(null);
  };

  if (showClosing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background px-4">
        <div className="w-full max-w-[400px]">
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-8 py-8">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
                  <span className="text-4xl">🌟</span>
                </div>
                <p className="text-lg font-semibold text-center leading-relaxed whitespace-pre-line text-foreground">
                  {closingMessage}
                </p>
                <Button
                  onClick={handleStart}
                  disabled={submitting}
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      처리 중...
                    </>
                  ) : (
                    "시작하기"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-background px-4"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="w-full max-w-[400px]">
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-8 py-8">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
                <span className="text-4xl">{slides[currentSlide].emoji}</span>
              </div>

              <p className="text-lg font-semibold text-center leading-relaxed whitespace-pre-line text-foreground min-h-[5rem]">
                {slides[currentSlide].text}
              </p>

              {/* Slide indicators */}
              <div className="flex items-center gap-2">
                {slides.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      index === currentSlide
                        ? "w-6 bg-primary"
                        : "w-2 bg-muted-foreground/30"
                    )}
                  />
                ))}
              </div>

              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                다음
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
