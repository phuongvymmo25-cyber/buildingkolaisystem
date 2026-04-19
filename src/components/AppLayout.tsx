import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ListChecks, DollarSign, Trophy, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCurrentMilestone } from "@/lib/missions";
import logo from "@/assets/logo.png";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Trang chủ", icon: Home },
  { to: "/missions", label: "Nhiệm vụ", icon: ListChecks },
  { to: "/income", label: "Dòng tiền", icon: DollarSign },
  { to: "/leaderboard", label: "Vinh danh", icon: Trophy },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const milestone = getCurrentMilestone(profile?.current_milestone ?? 0);

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-sidebar/80 backdrop-blur-xl fixed inset-y-0 left-0 z-30">
        <div className="px-6 py-6 flex items-center gap-3">
          <img src={logo} alt="KOL AI SYSTEM" width={36} height={36} className="drop-shadow-[0_0_12px_oklch(0.6_0.24_295/0.6)]" />
          <div>
            <div className="font-bold text-sm tracking-tight leading-tight">KOL AI</div>
            <div className="font-bold text-sm tracking-tight leading-tight text-gradient-primary">SYSTEM</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const active = item.to === "/" ? path === "/" : path.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-gradient-primary text-primary-foreground shadow-[0_4px_20px_-4px_oklch(0.55_0.24_295/0.6)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4">
          <Link to="/profile" className="flex items-center gap-3 mb-3 hover:bg-sidebar-accent/50 -mx-2 px-2 py-2 rounded-lg transition">
            <Avatar className="h-9 w-9 ring-2 ring-primary/30">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                {profile?.display_name?.slice(0, 2).toUpperCase() ?? "KOL"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{profile?.display_name ?? "..."}</div>
              <div className="text-xs text-muted-foreground truncate">
                {milestone ? `$${milestone.amount} • ${milestone.title}` : "Chưa có mốc"}
              </div>
            </div>
          </Link>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
          >
            <LogOut className="h-3.5 w-3.5" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="" width={28} height={28} />
            <span className="font-bold text-sm text-gradient-primary">KOL AI SYSTEM</span>
          </div>
          <Link to="/profile">
            <Avatar className="h-8 w-8 ring-2 ring-primary/30">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                {profile?.display_name?.slice(0, 2).toUpperCase() ?? "KOL"}
              </AvatarFallback>
            </Avatar>
          </Link>
        </header>

        <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-sidebar/95 backdrop-blur-xl border-t border-border">
        <div className="grid grid-cols-4">
          {NAV.map((item) => {
            const active = item.to === "/" ? path === "/" : path.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className={`h-5 w-5 ${active ? "drop-shadow-[0_0_6px_oklch(0.6_0.24_295/0.8)]" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
