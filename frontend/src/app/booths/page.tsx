"use client";

import { useEffect, useState, useMemo } from "react";
import { useRequireAuth } from "@/hooks/useAuth";
import { useCrowdStatus } from "@/hooks/useWebSocket";
import { api } from "@/lib/api";
import type { BoothListItem, GrowthKeyword } from "@/types";
import MobileShell from "@/components/layout/MobileShell";
import BoothCard from "@/components/booth/BoothCard";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, Loader2 } from "lucide-react";

export default function BoothsPage() {
  useRequireAuth();
  useCrowdStatus();

  const [booths, setBooths] = useState<BoothListItem[]>([]);
  const [keywords, setKeywords] = useState<GrowthKeyword[]>([]);
  const [search, setSearch] = useState("");
  const [selectedKeywordId, setSelectedKeywordId] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [boothsData, keywordsData] = await Promise.all([
          api.get<BoothListItem[]>("/api/v1/booths"),
          api.get<GrowthKeyword[]>("/api/v1/keywords"),
        ]);
        setBooths(boothsData);
        setKeywords(keywordsData);
      } catch {
        // Error is handled by api layer
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredBooths = useMemo(() => {
    let result = booths;

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(query) ||
          b.code.toLowerCase().includes(query)
      );
    }

    if (selectedKeywordId !== null) {
      result = result.filter((b) =>
        b.keywords.some((kw) => kw.id === selectedKeywordId)
      );
    }

    return result;
  }, [booths, search, selectedKeywordId]);

  return (
    <MobileShell>
      <div className="p-4 space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="부스 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Keyword filter chips */}
        {keywords.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
            <button
              onClick={() => setSelectedKeywordId(null)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors",
                selectedKeywordId === null
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50"
              )}
            >
              전체
            </button>
            {keywords.map((kw) => (
              <button
                key={kw.id}
                onClick={() =>
                  setSelectedKeywordId(
                    selectedKeywordId === kw.id ? null : kw.id
                  )
                }
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors",
                  selectedKeywordId === kw.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50"
                )}
              >
                {kw.name}
              </button>
            ))}
          </div>
        )}

        {/* Booth list */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredBooths.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">
              {search || selectedKeywordId
                ? "검색 결과가 없습니다."
                : "등록된 부스가 없습니다."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBooths.map((booth) => (
              <BoothCard key={booth.id} booth={booth} />
            ))}
          </div>
        )}
      </div>
    </MobileShell>
  );
}
