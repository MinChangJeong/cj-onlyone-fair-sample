"use client";

import { useEffect, useState } from "react";
import { useRequireAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import type { LearningRecord } from "@/types";
import MobileShell from "@/components/layout/MobileShell";
import LearningCard from "@/components/learning/LearningCard";
import { Loader2, BookOpen } from "lucide-react";

export default function MyLearningRecordsPage() {
  useRequireAuth();

  const [records, setRecords] = useState<LearningRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const data = await api.get<LearningRecord[]>(
          "/api/v1/learning-records/my"
        );
        setRecords(data);
      } catch {
        // Error handled by api layer
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  return (
    <MobileShell>
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-bold">내 배움 기록</h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                아직 기록한 배움이 없어요.
              </p>
              <p className="text-xs text-muted-foreground">
                부스를 방문하고 배운 점을 남겨보세요!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <LearningCard
                key={record.id}
                record={record}
                showBoothName={true}
              />
            ))}
          </div>
        )}
      </div>
    </MobileShell>
  );
}
