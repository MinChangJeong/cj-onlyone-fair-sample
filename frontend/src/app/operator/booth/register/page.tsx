"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireRole } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import type { BoothDetail } from "@/types";
import MobileShell from "@/components/layout/MobileShell";
import KeywordSelector from "@/components/learning/KeywordSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

interface BoothFormData {
  code: string;
  name: string;
  ideaSummary: string;
  wrongAssumption: string;
  trialMoments: string;
  learningPivot: string;
  currentState: string;
  locationDesc: string;
}

const formFields: {
  key: keyof BoothFormData;
  label: string;
  placeholder: string;
  type: "input" | "textarea";
  maxLength?: number;
}[] = [
  {
    key: "code",
    label: "부스 코드",
    placeholder: "4자리 영숫자 코드 (예: AB12)",
    type: "input",
    maxLength: 4,
  },
  {
    key: "name",
    label: "부스 이름",
    placeholder: "부스 이름을 입력해주세요",
    type: "input",
  },
  {
    key: "ideaSummary",
    label: "💡 아이디어 요약",
    placeholder: "핵심 아이디어를 간략히 설명해주세요",
    type: "textarea",
  },
  {
    key: "wrongAssumption",
    label: "❓ 초기 가설의 오류",
    placeholder: "처음에 어떤 가설이 잘못되었나요?",
    type: "textarea",
  },
  {
    key: "trialMoments",
    label: "🔄 시행착오 순간들",
    placeholder: "어떤 시행착오를 겪었나요?",
    type: "textarea",
  },
  {
    key: "learningPivot",
    label: "📚 배움과 전환",
    placeholder: "무엇을 배우고 어떻게 전환했나요?",
    type: "textarea",
  },
  {
    key: "currentState",
    label: "📍 현재 상태",
    placeholder: "현재 어떤 상태인가요?",
    type: "textarea",
  },
  {
    key: "locationDesc",
    label: "위치 설명",
    placeholder: "부스 위치를 입력해주세요 (예: A구역 3번)",
    type: "input",
  },
];

export default function BoothRegisterPage() {
  useRequireRole("BOOTH_OPERATOR");
  const router = useRouter();

  const [formData, setFormData] = useState<BoothFormData>({
    code: "",
    name: "",
    ideaSummary: "",
    wrongAssumption: "",
    trialMoments: "",
    learningPivot: "",
    currentState: "",
    locationDesc: "",
  });
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateField = (key: keyof BoothFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const canSubmit =
    formData.code.length === 4 &&
    formData.name.trim().length > 0 &&
    !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      await api.post<BoothDetail>("/api/v1/booths", {
        code: formData.code.toUpperCase(),
        name: formData.name.trim(),
        ideaSummary: formData.ideaSummary.trim() || null,
        wrongAssumption: formData.wrongAssumption.trim() || null,
        trialMoments: formData.trialMoments.trim() || null,
        learningPivot: formData.learningPivot.trim() || null,
        currentState: formData.currentState.trim() || null,
        locationDesc: formData.locationDesc.trim() || null,
        keywordIds: selectedKeywordIds,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/booths");
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "부스 등록 중 오류가 발생했습니다."
      );
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <MobileShell>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <h2 className="text-lg font-bold">부스 등록 완료!</h2>
            <p className="text-sm text-muted-foreground">
              부스 목록으로 이동합니다...
            </p>
          </div>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="p-4 space-y-4 pb-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>뒤로</span>
        </button>

        <h2 className="text-lg font-bold">부스 등록</h2>

        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              {formFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <label className="text-sm font-medium">{field.label}</label>
                  {field.type === "input" ? (
                    <Input
                      placeholder={field.placeholder}
                      value={formData[field.key]}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (field.key === "code") {
                          value = value.toUpperCase().slice(0, 4);
                        }
                        updateField(field.key, value);
                      }}
                      maxLength={field.maxLength}
                      className={
                        field.key === "code"
                          ? "font-mono uppercase tracking-widest"
                          : ""
                      }
                    />
                  ) : (
                    <Textarea
                      placeholder={field.placeholder}
                      value={formData[field.key]}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                  )}
                </div>
              ))}

              {/* Keyword selector */}
              <KeywordSelector
                selectedIds={selectedKeywordIds}
                onChange={setSelectedKeywordIds}
              />

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
                    등록 중...
                  </>
                ) : (
                  "부스 등록"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MobileShell>
  );
}
