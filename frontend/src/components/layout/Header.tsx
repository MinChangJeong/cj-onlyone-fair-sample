"use client";

import { useAuthStore } from "@/stores/authStore";
import { Badge } from "@/components/ui/badge";

const roleLabels: Record<string, string> = {
  PARTICIPANT: "참가자",
  BOOTH_OPERATOR: "부스운영자",
  ADMIN: "관리자",
};

export default function Header() {
  const { isAuthenticated, participant } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <h1 className="text-lg font-bold tracking-tight text-primary">
        CJ ONLYONE FAIR
      </h1>
      {isAuthenticated && participant && (
        <Badge variant="secondary" className="text-xs">
          {roleLabels[participant.role] || participant.role}
        </Badge>
      )}
    </header>
  );
}
