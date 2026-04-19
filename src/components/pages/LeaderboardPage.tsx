import { useEffect, useState } from "react";
import { Crown, Share2 } from "lucide-react";
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
      if (range === "all") {
        const { data } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url, total_points, current_milestone")
          .order("total_points", { ascending: false })
          .limit(50);
        setRows((data as LeaderRow[]) ?? []);
      } else {
        // Aggregate points from missions in range
        const days = range === "week" ? 7 : 30;
        const since = new Date();
        since.setDate(since.getDate() - days);
        const { data } = await supabase
          .from("daily_missions")
          .select("user_id, points_awarded")
          .gte("date", since.toISOString().slice(0, 10));
        const byUser: Record<string, number> = {};
        data?.forEach((r) => {
          byUser[r.user_id] = (byUser[r.user_id] ?? 0) + (r.points_awarded || 0);
        });
        const ids = Object.keys(byUser);
        if (ids.length === 0) { setRows([]); return; }
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url, total_points, current_milestone")
          .in("id", ids);
        const merged = (profiles as LeaderRow[] ?? [])
          .map((p) => ({ ...p, total_points: byUser[p.id] ?? 0 }))
          .sort((a, b) => b.total_points - a.total_points);
        setRows(merged);
      }
    };
    load();
  }, [range]);

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);

  const myRank = user ? rows.findIndex((r) => r.id === user.id) + 1 : 0;

  const share = () => {
    const me = rows.find((r) => r.id === user?.id);
    if (!me) return;
    const text = `🏆 Tôi đang xếp #${myRank} trên KOL AI SYSTEM với ${me.total_points} điểm! Cùng chinh phục $1,000 trong 30 ngày 🚀 #KOLAISystem`;
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép xếp hạng!");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Vinh danh</h1>
          <p className="text-sm text-muted-foreground mt-1">Bảng xếp hạng KOL AI SYSTEM.</p>
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
          {top3.length > 0 && (
            <div className="grid grid-cols-3 gap-2 md:gap-4 items-end">
              {/* #2 */}
              <PodiumCard row={top3[1]} rank={2} height="h-28" />
              {/* #1 */}
              <PodiumCard row={top3[0]} rank={1} height="h-36" gold />
              {/* #3 */}
              <PodiumCard row={top3[2]} rank={3} height="h-24" />
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
                  <div className="font-bold text-sm truncate">{r.display_name}</div>
                  <div className="text-[10px] text-gold font-semibold">${r.current_milestone}</div>
                </div>
                <div className="font-black text-sm">{r.total_points} <span className="text-[10px] text-muted-foreground">đ</span></div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PodiumCard({ row, rank, height, gold }: { row?: LeaderRow; rank: number; height: string; gold?: boolean }) {
  if (!row) return <div />;
  const ringClass = rank === 1 ? "ring-gold" : rank === 2 ? "ring-slate-400" : "ring-amber-700";
  return (
    <div className="flex flex-col items-center">
      {rank === 1 && <Crown className="h-6 w-6 text-gold mb-1 drop-shadow-[0_0_8px_oklch(0.78_0.16_75/0.8)]" fill="currentColor" />}
      <Avatar className={`h-16 w-16 md:h-20 md:w-20 ring-4 ${ringClass} ${gold ? "glow-gold" : ""}`}>
        <AvatarImage src={row.avatar_url ?? undefined} />
        <AvatarFallback className="bg-primary/20 text-primary font-black">
          {row.display_name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="text-xs font-bold mt-2 truncate max-w-full text-center px-1">{row.display_name}</div>
      <div className="text-[10px] text-muted-foreground">{row.total_points} điểm</div>
      <div className={`mt-2 w-full ${height} rounded-t-xl ${gold ? "bg-gradient-gold" : "bg-gradient-to-b from-muted to-card"} flex items-start justify-center pt-2`}>
        <span className={`text-2xl font-black ${gold ? "text-amber-950" : "text-foreground"}`}>{rank}</span>
      </div>
    </div>
  );
}
