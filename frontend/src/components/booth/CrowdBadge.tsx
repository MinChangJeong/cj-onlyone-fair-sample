"use client";

import type { CrowdLevel } from "@/types";
import { cn } from "@/lib/utils";

const crowdConfig: Record<
  CrowdLevel,
  { label: string; dotColor: string; bgColor: string; textColor: string }
> = {
  LOW: {
    label: "여유",
    dotColor: "bg-green-500",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
  },
  MEDIUM: {
    label: "보통",
    dotColor: "bg-yellow-500",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700",
  },
  HIGH: {
    label: "혼잡",
    dotColor: "bg-red-500",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
  },
};

interface CrowdBadgeProps {
  level: CrowdLevel;
  className?: string;
}

export default function CrowdBadge({ level, className }: CrowdBadgeProps) {
  const config = crowdConfig[level];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        config.bgColor,
        config.textColor,
        className
      )}
    >
      <span
        className={cn("h-2 w-2 rounded-full", config.dotColor)}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}
