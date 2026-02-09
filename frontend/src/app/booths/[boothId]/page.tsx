"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import type { BoothDetail, LearningRecord } from "@/types";
import MobileShell from "@/components/layout/MobileShell";
import CrowdBadge from "@/components/booth/CrowdBadge";
import LearningCard from "@/components/learning/LearningCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2, PenLine, MapPin } from "lucide-react";

interface StoryStep {
  emoji: string;
  label: string;
  content: string | null;
}

export default function BoothDetailPage() {
  useRequireAuth();
  const params = useParams();
  const router = useRouter();
  const boothId = params.boothId as string;

  const [booth, setBooth] = useState<BoothDetail | null>(null);
  const [records, setRecords] = useState<LearningRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [boothData, recordsData] = await Promise.all([
          api.get<BoothDetail>(`/api/v1/booths/${boothId}`),
          api.get<LearningRecord[]>(
            `/api/v1/booths/${boothId}/learning-records`
          ),
        ]);
        setBooth(boothData);
        setRecords(recordsData);
      } catch {
        // Error handled by api layer
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [boothId]);

  if (loading || !booth) {
    return (
      <MobileShell>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </MobileShell>
    );
  }

  const storySteps: StoryStep[] = [
    {
      emoji: "💡",
      label: "아이디어 요약",
      content: booth.ideaSummary,
    },
    {
      emoji: "❓",
      label: "초기 가설의 오류",
      content: booth.wrongAssumption,
    },
    {
      emoji: "🔄",
      label: "시행착오 순간들",
      content: booth.trialMoments,
    },
    {
      emoji: "📚",
      label: "배움과 전환",
      content: booth.learningPivot,
    },
    {
      emoji: "📍",
      label: "현재 상태",
      content: booth.currentState,
    },
  ];

  return (
    <MobileShell>
      <div className="p-4 pb-24 space-y-4">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>목록으로</span>
        </button>

        {/* Booth header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h2 className="text-xl font-bold">{booth.name}</h2>
              <span className="text-sm text-muted-foreground font-mono">
                {booth.code}
              </span>
            </div>
            <CrowdBadge level={booth.crowdLevel} />
          </div>

          {booth.locationDesc && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>{booth.locationDesc}</span>
            </div>
          )}

          {booth.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {booth.keywords.map((kw) => (
                <Badge key={kw.id} variant="secondary" className="text-xs">
                  {kw.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Learning-first 5-step story structure */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold">배움의 여정</h3>
          {storySteps.map((step, index) => {
            if (!step.content) return null;
            return (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 shrink-0 text-lg">
                      {step.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-primary mb-1">
                        {step.label}
                      </p>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {step.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Learning records */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold">
            참가자 배운 점 ({records.length})
          </h3>
          {records.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              아직 기록된 배움이 없어요. 첫 번째로 남겨보세요!
            </p>
          ) : (
            records.map((record) => (
              <LearningCard key={record.id} record={record} />
            ))
          )}
        </div>
      </div>

      {/* Floating action button */}
      <div className="fixed bottom-20 right-4 max-w-[480px] z-30">
        <Button
          onClick={() => router.push(`/learning/new?boothId=${boothId}`)}
          className="h-12 px-5 rounded-full shadow-lg gap-2"
          size="lg"
        >
          <PenLine className="h-4 w-4" />
          배운 점 남기기
        </Button>
      </div>
    </MobileShell>
  );
}
