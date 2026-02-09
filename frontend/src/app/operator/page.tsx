"use client";

import Link from "next/link";
import { useRequireRole } from "@/hooks/useAuth";
import MobileShell from "@/components/layout/MobileShell";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Tags, ChevronRight } from "lucide-react";

const menuItems = [
  {
    href: "/operator/booth/register",
    icon: Building2,
    title: "부스 등록",
    description: "새로운 부스를 등록하고 배움의 여정을 설정합니다.",
  },
  {
    href: "/operator/keywords",
    icon: Tags,
    title: "키워드 관리",
    description: "성장 키워드를 추가, 수정, 삭제합니다.",
  },
];

export default function OperatorPage() {
  useRequireRole("BOOTH_OPERATOR");

  return (
    <MobileShell>
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-bold">운영자 대시보드</h2>

        <div className="space-y-3">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md active:shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 shrink-0">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base">{item.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}
