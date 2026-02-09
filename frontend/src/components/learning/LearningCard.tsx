"use client";

import Link from "next/link";
import type { LearningRecord } from "@/types";
import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ResonanceButtons from "@/components/learning/ResonanceButtons";
import { Pencil } from "lucide-react";

interface LearningCardProps {
  record: LearningRecord;
  showBoothName?: boolean;
}

export default function LearningCard({
  record,
  showBoothName = false,
}: LearningCardProps) {
  const participant = useAuthStore((s) => s.participant);
  const isOwn = participant?.id === record.participantId;

  const formattedDate = new Date(record.createdAt).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {showBoothName && (
              <p className="text-xs text-primary font-medium mb-1">
                {record.boothName}
              </p>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {record.participantName || "익명"}
              </span>
              <span className="text-xs text-muted-foreground">
                {formattedDate}
              </span>
            </div>
          </div>
          {isOwn && (
            <Link
              href={`/learning/${record.id}/edit`}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <Pencil className="h-4 w-4" />
            </Link>
          )}
        </div>

        {/* Content */}
        <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
          {record.content}
        </p>

        {/* Keywords */}
        {record.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {record.keywords.map((kw) => (
              <Badge key={kw.id} variant="secondary" className="text-xs">
                {kw.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Resonance buttons */}
        <ResonanceButtons
          recordId={record.id}
          supportCount={record.supportCount}
          sharedExperienceCount={record.sharedExperienceCount}
          myResonances={record.myResonances}
        />
      </CardContent>
    </Card>
  );
}
