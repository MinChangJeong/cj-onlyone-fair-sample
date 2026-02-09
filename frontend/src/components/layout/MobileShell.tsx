"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Building2, QrCode, BookOpen } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/Header";

const navItems = [
  { href: "/booths", label: "부스 목록", icon: Building2 },
  { href: "/checkin", label: "체크인", icon: QrCode },
  { href: "/learning", label: "내 기록", icon: BookOpen },
];

interface MobileShellProps {
  children: React.ReactNode;
}

export default function MobileShell({ children }: MobileShellProps) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="mx-auto max-w-[480px] min-h-screen flex flex-col bg-background shadow-sm">
      <Header />
      <main className="flex-1 overflow-y-auto">{children}</main>
      {isAuthenticated && (
        <nav className="sticky bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-around h-16">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs transition-colors",
                    isActive
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
