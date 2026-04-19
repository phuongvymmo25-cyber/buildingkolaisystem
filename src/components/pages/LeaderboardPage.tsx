import { useEffect, useState } from "react";
import { Crown, Share2, Star, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LeaderRow {
  id: string;
  display_name: string;
  avatar_url: string | null;
  total_points: number;
  current_milestone: number;
}

type Range = "all" | "week" | "month";

export function LeaderboardPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [range, setRange] = useState<Range>("all");

  useEffect(() => {
    const load = async () => {
      // Đo bằng TIỀN (current_milestone), tie-break bằng điểm
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, total_points, current_milestone")
        .order("current_milestone", { ascending: false })
        .order("total_points", { ascending: false })
        .limit(50);

      let result = (data as LeaderRow[]) ?? [];

      if (range !== "all") {
        const days = range === "week" ? 7 : 30;
        const since = new Date();
        since.setDate(since.getDate() - days);
        const { data: ms } = await supabase
          .from("income_milestones")
          .select("user_id, milestone_amount, achieved_at")
          .gte("achieved_at", since.toISOString());
        const byUser: Record<string, number> = {};
        ms?.forEach((r) => {
          byUser[r.user_id] = Math.max(byUser[r.user_id] ?? 0, Number(r.milestone_amount));
        });
        result = result
          .map((p) => ({ ...p, current_milestone: byUser[p.id] ?? 0 }))
          .filter((p) => p.current_milestone > 0)
          .sort((a, b) => b.current_milestone - a.current_milestone || b.total_points - a.total_points);
      }
      setRows(result);
    };
    load();
  }, [range]);

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);
  const myRank = user ? rows.findIndex((r) => r.id === user.id) + 1 : 0;

  const share = () => {
    const me = rows.find((r) => r.id === user?.id);
    if (!me) return;
    const text = `🏆 Tôi đang xếp #${myRank} trên KOL AI SYSTEM với mốc $${me.current_milestone}! Cùng chinh phục $1,000 trong 30 ngày 🚀 #KOLAISystem`;
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép xếp hạng!");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Vinh danh</h1>
          <p className="text-sm text-muted-foreground mt-1">Bảng xếp hạng đo theo dòng tiền đạt được.</p>
        </div>
        {myRank > 0 && (
          <Button onClick={share} variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-1" /> Chia sẻ
          </Button>
        )}
      </div>

      <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
        <TabsList className="bg-muted/50 w-full grid grid-cols-3">
          <TabsTrigger value="week">Tuần này</TabsTrigger>
          <TabsTrigger value="month">Tháng này</TabsTrigger>
          <TabsTrigger value="all">Toàn thời gian</TabsTrigger>
        </TabsList>

        <TabsContent value={range} className="mt-5 space-y-5">
          {/* Header HUYỀN THOẠI KOL AI */}
          {top3.length > 0 && (
            <div className="text-center">
              <h2 className="text-2xl md:text-4xl font-black tracking-[0.2em] uppercase bg-gradient-to-r from-gold via-primary-glow to-gold bg-clip-text text-transparent drop-shadow-[0_0_24px_oklch(0.78_0.16_75/0.4)]">
                Huyền thoại KOL AI
              </h2>
            </div>
          )}

          {top3.length > 0 && (
            <div className="grid grid-cols-3 gap-2 md:gap-4 items-end">
              <PodiumCard row={top3[1]} rank={2} variant="silver" />
              <PodiumCard row={top3[0]} rank={1} variant="gold" featured />
              <PodiumCard row={top3[2]} rank={3} variant="purple" />
            </div>
          )}

          {rows.length === 0 && (
            <Card className="p-10 text-center bg-card/60 border-border">
              <div className="text-4xl mb-3">📊</div>
              <div className="text-sm text-muted-foreground">Chưa có dữ liệu — hãy là người đầu tiên!</div>
            </Card>
          )}

          <div className="space-y-2">
            {rest.map((r, i) => (
              <Card
                key={r.id}
                className={`p-3 flex items-center gap-3 border transition ${
                  r.id === user?.id
                    ? "bg-primary/15 border-primary/40"
                    : "bg-card/60 backdrop-blur border-border"
                }`}
              >
                <div className="w-7 text-center font-black text-muted-foreground">{i + 4}</div>
                <Avatar className="h-9 w-9">
                  <AvatarImage src={r.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                    {r.display_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate text-white">{r.display_name}</div>
                  <div className="text-[10px] text-muted-foreground">{r.total_points} điểm</div>
                </div>
                <div className="font-black text-sm text-gold">${r.current_milestone}</div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PodiumCard({
  row,
  rank,
  variant,
  featured,
}: {
  row?: LeaderRow;
  rank: number;
  variant: "gold" | "silver" | "purple";
  featured?: boolean;
}) {
  if (!row) return <div />;
  const frameClass =
    variant === "gold" ? "legend-gold" : variant === "purple" ? "legend-purple" : "legend-silver";
  const tagBg =
    variant === "gold"
      ? "bg-gradient-to-r from-gold to-amber-500"
      : variant === "purple"
        ? "bg-gradient-to-r from-primary to-primary-glow"
        : "bg-gradient-to-r from-slate-400 to-slate-600";

  return (
    <div className={`relative ${featured ? "md:-mt-6" : ""}`}>
      <div className={`legend-frame ${frameClass} bg-card/80 backdrop-blur-sm`}>
        <div className="legend-shine" />

        {featured && (
          <Crown
            className="absolute -top-3 left-1/2 -translate-x-1/2 h-7 w-7 text-gold drop-shadow-[0_0_10px_oklch(0.78_0.16_75/0.9)]"
            fill="currentColor"
          />
        )}

        <div className="relative flex flex-col items-center text-center">
          {/* Avatar với vòng "ngắm" */}
          <div className="relative">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full -z-0 opacity-70" aria-hidden>
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke={variant === "gold" ? "oklch(0.78 0.16 75)" : variant === "purple" ? "oklch(0.68 0.25 295)" : "oklch(0.78 0.02 280)"}
                strokeWidth="1.5"
                strokeDasharray="4 6"
              />
              <line x1="50" y1="0" x2="50" y2="10" stroke="currentColor" className={variant === "gold" ? "text-gold" : variant === "purple" ? "text-primary" : "text-slate-400"} strokeWidth="2" />
              <line x1="50" y1="90" x2="50" y2="100" stroke="currentColor" className={variant === "gold" ? "text-gold" : variant === "purple" ? "text-primary" : "text-slate-400"} strokeWidth="2" />
              <line x1="0" y1="50" x2="10" y2="50" stroke="currentColor" className={variant === "gold" ? "text-gold" : variant === "purple" ? "text-primary" : "text-slate-400"} strokeWidth="2" />
              <line x1="90" y1="50" x2="100" y2="50" stroke="currentColor" className={variant === "gold" ? "text-gold" : variant === "purple" ? "text-primary" : "text-slate-400"} strokeWidth="2" />
            </svg>
            <Avatar className={`relative h-16 w-16 md:h-20 md:w-20 m-2 ring-2 ${variant === "gold" ? "ring-gold" : variant === "purple" ? "ring-primary" : "ring-slate-400"}`}>
              <AvatarImage src={row.avatar_url ?? undefined} />
              <AvatarFallback className="bg-primary/20 text-primary font-black">
                {row.display_name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* TOP tag */}
          <div className={`mt-1 px-3 py-0.5 rounded-full text-[10px] font-black tracking-widest text-background ${tagBg}`}>
            TOP {rank}
          </div>

          <div className="mt-2 text-sm md:text-base font-black text-white truncate max-w-full px-1">
            {row.display_name}
          </div>

          <div className="mt-2 flex items-center gap-1 text-gold font-black text-base md:text-lg">
            <Star className="h-4 w-4" fill="currentColor" />
            ${row.current_milestone}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {row.total_points} <Flame className="h-3 w-3 text-orange-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
