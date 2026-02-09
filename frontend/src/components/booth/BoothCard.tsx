"use client";

import { useRouter } from "next/navigation";
import type { BoothListItem, CrowdLevel } from "@/types";
import { useCrowdStore } from "@/stores/crowdStore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CrowdBadge from "@/components/booth/CrowdBadge";
import { MapPin } from "lucide-react";

interface BoothCardProps {
  booth: BoothListItem;
}

export default function BoothCard({ booth }: BoothCardProps) {
  const router = useRouter();
  const crowdData = useCrowdStore((s) => s.boothLevels[booth.id]);

  const crowdLevel: CrowdLevel = crowdData?.level ?? booth.crowdLevel;

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md active:shadow-sm"
      onClick={() => router.push(`/booths/${booth.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-base truncate">{booth.name}</h3>
              <span className="text-xs text-muted-foreground font-mono shrink-0">
                {booth.code}
              </span>
            </div>

            {booth.locationDesc && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{booth.locationDesc}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 mt-2">
              {booth.keywords.map((kw) => (
                <Badge key={kw.id} variant="secondary" className="text-xs">
                  {kw.name}
                </Badge>
              ))}
            </div>
          </div>

          <CrowdBadge level={crowdLevel} className="shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}
