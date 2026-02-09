"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import type { LearningRecord } from "@/types";
import MobileShell from "@/components/layout/MobileShell";
import KeywordSelector from "@/components/learning/KeywordSelector";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";

export default function EditLearningRecordPage() {
  useRequireAuth();
  const params = useParams();
  const router = useRouter();
  const recordId = params.recordId as string;

  const [record, setRecord] = useState<LearningRecord | null>(null);
  const [content, setContent] = useState("");
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const data = await api.get<LearningRecord>(
          `/api/v1/learning-records/${recordId}`
        );
        setRecord(data);
        setContent(data.content);
        setSelectedKeywordIds(data.keywords.map((k) => k.id));
      } catch {
        // Error handled by api layer
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [recordId]);

  const canSubmit =
    content.trim().length > 0 && selectedKeywordIds.length > 0 && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      await api.put<LearningRecord>(`/api/v1/learning-records/${recordId}`, {
        content: content.trim(),
        keywordIds: selectedKeywordIds,
      });
      router.push(`/booths/${record?.boothId}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "기록 수정 중 오류가 발생했습니다."
      );
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/v1/learning-records/${recordId}`);
      router.push(`/booths/${record?.boothId}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "기록 삭제 중 오류가 발생했습니다."
      );
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <MobileShell>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </MobileShell>
    );
  }

  if (!record) {
    return (
      <MobileShell>
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-muted-foreground">
            기록을 찾을 수 없습니다.
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

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">기록 수정</h2>

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                삭제
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[340px]">
              <DialogHeader>
                <DialogTitle>기록 삭제</DialogTitle>
                <DialogDescription>
                  이 배움 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      삭제 중...
                    </>
                  ) : (
                    "삭제"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

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
                  "수정 완료"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MobileShell>
  );
}
