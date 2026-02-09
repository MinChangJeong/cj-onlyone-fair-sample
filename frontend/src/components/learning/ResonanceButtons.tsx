"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import type { ResonanceResponse, ResonanceType } from "@/types";
import { cn } from "@/lib/utils";

interface ResonanceButtonsProps {
  recordId: number;
  supportCount: number;
  sharedExperienceCount: number;
  myResonances: string[];
}

export default function ResonanceButtons({
  recordId,
  supportCount: initialSupportCount,
  sharedExperienceCount: initialSharedCount,
  myResonances: initialMyResonances,
}: ResonanceButtonsProps) {
  const [supportCount, setSupportCount] = useState(initialSupportCount);
  const [sharedCount, setSharedCount] = useState(initialSharedCount);
  const [myResonances, setMyResonances] = useState<string[]>(initialMyResonances);
  const [loading, setLoading] = useState(false);

  const handleResonance = useCallback(
    async (type: ResonanceType) => {
      if (loading) return;

      const isActive = myResonances.includes(type);

      // Optimistic update
      if (isActive) {
        setMyResonances((prev) => prev.filter((r) => r !== type));
        if (type === "SUPPORT") setSupportCount((c) => Math.max(0, c - 1));
        else setSharedCount((c) => Math.max(0, c - 1));
      } else {
        setMyResonances((prev) => [...prev, type]);
        if (type === "SUPPORT") setSupportCount((c) => c + 1);
        else setSharedCount((c) => c + 1);
      }

      setLoading(true);
      try {
        const result = await api.post<ResonanceResponse>(
          "/api/v1/resonances",
          { recordId, type }
        );

        // Reconcile with server response
        if (result.toggled) {
          if (!myResonances.includes(type) && !isActive) {
            // Already handled optimistically
          }
        } else {
          if (myResonances.includes(type) && isActive) {
            // Already handled optimistically
          }
        }
      } catch {
        // Revert optimistic update on error
        if (isActive) {
          setMyResonances((prev) => [...prev, type]);
          if (type === "SUPPORT") setSupportCount((c) => c + 1);
          else setSharedCount((c) => c + 1);
        } else {
          setMyResonances((prev) => prev.filter((r) => r !== type));
          if (type === "SUPPORT") setSupportCount((c) => Math.max(0, c - 1));
          else setSharedCount((c) => Math.max(0, c - 1));
        }
      } finally {
        setLoading(false);
      }
    },
    [recordId, myResonances, loading]
  );

  const isSupportActive = myResonances.includes("SUPPORT");
  const isSharedActive = myResonances.includes("SHARED_EXPERIENCE");

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleResonance("SUPPORT")}
        className={cn(
          "text-xs gap-1.5 h-8",
          isSupportActive && "bg-primary/10 border-primary text-primary"
        )}
      >
        <span>👍</span>
        <span>응원해요</span>
        <span className="font-semibold">{supportCount}</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleResonance("SHARED_EXPERIENCE")}
        className={cn(
          "text-xs gap-1.5 h-8",
          isSharedActive && "bg-primary/10 border-primary text-primary"
        )}
      >
        <span>🤝</span>
        <span>나도 비슷했어요</span>
        <span className="font-semibold">{sharedCount}</span>
      </Button>
    </div>
  );
}
