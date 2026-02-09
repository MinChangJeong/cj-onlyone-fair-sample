"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ParticipantRole } from "@/types";

const DEV_PROFILES: {
  label: string;
  role: ParticipantRole;
  onboardingDone: boolean;
}[] = [
  {
    label: "일반 참가자 (온보딩 완료)",
    role: "PARTICIPANT",
    onboardingDone: true,
  },
  {
    label: "일반 참가자 (온보딩 미완료)",
    role: "PARTICIPANT",
    onboardingDone: false,
  },
  {
    label: "부스 운영자",
    role: "BOOTH_OPERATOR",
    onboardingDone: true,
  },
  {
    label: "관리자",
    role: "ADMIN",
    onboardingDone: true,
  },
];

export default function DevLoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [selected, setSelected] = useState<number | null>(null);

  if (process.env.NODE_ENV === "production") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">이 페이지는 개발 환경에서만 사용할 수 있습니다.</p>
      </div>
    );
  }

  const handleLogin = (index: number) => {
    const profile = DEV_PROFILES[index];
    const mockToken = `dev-token-${Date.now()}`;

    setSession(mockToken, {
      id: 1,
      displayName: `Dev ${profile.role}`,
      role: profile.role,
      onboardingDone: profile.onboardingDone,
    });

    setSelected(index);

    if (!profile.onboardingDone) {
      router.push("/onboarding");
    } else {
      router.push("/booths");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <div className="w-full max-w-[400px] space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold">Dev Login</h1>
          <p className="text-sm text-muted-foreground">
            로컬 테스트용 인증 우회 (개발 환경 전용)
          </p>
        </div>

        <Card>
          <CardContent className="p-4 space-y-3">
            {DEV_PROFILES.map((profile, i) => (
              <Button
                key={i}
                variant={selected === i ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => handleLogin(i)}
              >
                {profile.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-medium">페이지 목록:</p>
          <ul className="space-y-0.5">
            <li>/booths — 부스 목록</li>
            <li>/booths/1 — 부스 상세</li>
            <li>/checkin — 체크인</li>
            <li>/learning/new?boothId=1 — 학습 기록 작성</li>
            <li>/learning — 내 학습 기록</li>
            <li>/operator — 운영자 대시보드</li>
            <li>/operator/booth/register — 부스 등록</li>
            <li>/operator/keywords — 키워드 관리</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
