"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { GrowthKeyword } from "@/types";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface KeywordSelectorProps {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  keywords?: GrowthKeyword[];
}

export default function KeywordSelector({
  selectedIds,
  onChange,
  keywords: externalKeywords,
}: KeywordSelectorProps) {
  const [keywords, setKeywords] = useState<GrowthKeyword[]>(
    externalKeywords || []
  );
  const [loading, setLoading] = useState(!externalKeywords);

  useEffect(() => {
    if (externalKeywords) {
      setKeywords(externalKeywords);
      return;
    }

    const fetchKeywords = async () => {
      try {
        const data = await api.get<GrowthKeyword[]>("/api/v1/keywords");
        setKeywords(data);
      } catch {
        // Error handled by api layer
      } finally {
        setLoading(false);
      }
    };

    fetchKeywords();
  }, [externalKeywords]);

  const toggleKeyword = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((k) => k !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (keywords.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-2">
        등록된 성장 키워드가 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        성장 키워드 선택
      </label>
      <div className="flex flex-wrap gap-2">
        {keywords.map((kw) => {
          const isSelected = selectedIds.includes(kw.id);
          return (
            <button
              key={kw.id}
              type="button"
              onClick={() => toggleKeyword(kw.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium border transition-all",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              )}
            >
              {kw.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
