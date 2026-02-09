"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRequireAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import type { LearningRecord } from "@/types";
import MobileShell from "@/components/layout/MobileShell";
import KeywordSelector from "@/components/learning/KeywordSelector";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";

function NewLearningRecordContent() {
  useRequireAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const boothId = searchParams.get("boothId");

  const [content, setContent] = useState("");
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    content.trim().length > 0 && selectedKeywordIds.length > 0 && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !boothId) return;

    setSubmitting(true);
    setError(null);

    try {
      await api.post<LearningRecord>("/api/v1/learning-records", {
        boothId: Number(boothId),
        content: content.trim(),
        keywordIds: selectedKeywordIds,
      });
      router.push(`/booths/${boothId}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "기록 저장 중 오류가 발생했습니다."
      );
      setSubmitting(false);
    }
  };

  if (!boothId) {
    return (
      <MobileShell>
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-muted-foreground">
            부스 정보가 없습니다. 부스 목록에서 다시 시도해주세요.
          </p>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="p-4 space-y-4">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>뒤로</span>
        </button>

        <h2 className="text-lg font-bold">배운 점 남기기</h2>

        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Content textarea */}
              <div className="space-y-2">
                <label className="text-sm font-medium">배운 점</label>
                <Textarea
                  placeholder="이 부스에서 배운 점을 자유롭게 작성해주세요"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
              </div>

              {/* Keyword selector */}
              <KeywordSelector
                selectedIds={selectedKeywordIds}
                onChange={setSelectedKeywordIds}
              />
              {selectedKeywordIds.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  최소 1개의 성장 키워드를 선택해주세요.
                </p>
              )}

              {/* Error */}
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                disabled={!canSubmit}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  "기록 저장"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MobileShell>
  );
}

export default function NewLearningRecordPage() {
  return (
    <Suspense
      fallback={
        <MobileShell>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </MobileShell>
      }
    >
      <NewLearningRecordContent />
    </Suspense>
  );
}
