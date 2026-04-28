import { useEffect, useState } from "react";
import { Crown, Share2, Star, Flame, Trash2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  const { isAdmin } = useIsAdmin();
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [range, setRange] = useState<Range>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const handleDelete = async (targetId: string, name: string) => {
    setDeletingId(targetId);
    const { error } = await supabase.rpc("admin_delete_user", { _target_user_id: targetId });
    setDeletingId(null);
    if (error) {
      toast.error("Xóa thất bại: " + error.message);
      return;
    }
    toast.success(`Đã xóa thành viên ${name}`);
    load();
  };

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
          {isAdmin && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-[10px] font-bold text-primary uppercase tracking-wider">
              <ShieldCheck className="h-3 w-3" /> Chế độ quản trị
            </div>
          )}
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
            <div className="grid grid-cols-3 gap-3 md:gap-5 items-end">
              <PodiumCard row={top3[1]} rank={2} variant="purple" />
              <PodiumCard row={top3[0]} rank={1} variant="gold" featured />
              <PodiumCard row={top3[2]} rank={3} variant="ruby" />
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
                className={`member-row p-3 flex items-center gap-3 rounded-xl ${
                  r.id === user?.id ? "member-row-self" : ""
                }`}
              >
                <div className="w-8 text-center font-black text-sm bg-gradient-to-b from-foreground/80 to-foreground/40 bg-clip-text text-transparent">
                  #{i + 4}
                </div>
                <Avatar className="h-10 w-10 ring-2 ring-primary/30">
                  <AvatarImage src={r.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                    {r.display_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate text-white">{r.display_name}</div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Flame className="h-2.5 w-2.5 text-orange-400" />
                    {r.total_points} điểm
                  </div>
                </div>
                <div className="font-black text-base text-transparent bg-clip-text bg-gradient-to-r from-gold to-amber-300 drop-shadow-[0_0_8px_oklch(0.78_0.16_75/0.4)]">
                  ${r.current_milestone}
                </div>
                {isAdmin && r.id !== user?.id && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        disabled={deletingId === r.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xóa thành viên?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bạn sắp xóa <span className="font-bold text-foreground">{r.display_name}</span> khỏi hệ thống. Toàn bộ dữ liệu (nhiệm vụ, mốc thu nhập, huy hiệu, hồ sơ và tài khoản đăng nhập) sẽ bị xóa vĩnh viễn và không thể khôi phục.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(r.id, r.display_name)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Xóa vĩnh viễn
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
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
  variant: "gold" | "purple" | "ruby";
  featured?: boolean;
}) {
  if (!row) return <div />;
  const cfg = {
    gold:   { frame: "legend-gold",   bg: "podium-bg-gold",   fire: "fire-gold",   tag: "bg-gradient-to-r from-gold to-amber-500", ring: "ring-gold",          accent: "oklch(0.85 0.18 80)",  text: "text-gold",     romanCol: "text-gold" },
    purple: { frame: "legend-purple", bg: "podium-bg-purple", fire: "fire-purple", tag: "bg-gradient-to-r from-primary to-primary-glow", ring: "ring-primary",  accent: "oklch(0.7 0.25 295)",  text: "text-primary-glow", romanCol: "text-primary-glow" },
    ruby:   { frame: "legend-ruby",   bg: "podium-bg-ruby",   fire: "fire-ruby",   tag: "bg-gradient-to-r from-red-500 to-rose-600", ring: "ring-red-400",     accent: "oklch(0.72 0.24 25)",  text: "text-red-400",  romanCol: "text-red-400" },
  }[variant];

  // ID khác nhau cho mỗi vòng SVG (tránh trùng path khi nhiều podium)
  const orbitId = `orbit-${variant}-${rank}`;
  const romanText = " ✦ I ✦ II ✦ III ✦ IV ✦ V ✦ VI ✦ VII ✦ VIII ✦ IX ✦ X ✦ XI ✦ XII ✦ ";

  return (
    <div className={`relative ${featured ? "md:-mt-8" : ""}`}>
      <div className={`legend-frame ${cfg.frame} ${cfg.bg} backdrop-blur-sm`}>
        <div className="legend-shine" />

        {featured && (
          <Crown
            className="absolute -top-4 left-1/2 -translate-x-1/2 h-9 w-9 text-gold drop-shadow-[0_0_14px_oklch(0.78_0.16_75/0.95)] z-10"
            fill="currentColor"
          />
        )}

        <div className="relative flex flex-col items-center text-center">
          {/* === HÀO QUANG: avatar + vòng lửa + chữ La Mã xoay === */}
          <div
            className={`relative ${featured ? "h-32 w-32 md:h-44 md:w-44" : "h-24 w-24 md:h-32 md:w-32"} flex items-center justify-center`}
          >
            {/* Vòng lửa xoay */}
            <div className={`fire-ring ${cfg.fire}`} />

            {/* Vòng nét đứt xoay ngược */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full halo-rotate-rev opacity-80" aria-hidden>
              <circle cx="50" cy="50" r="48" fill="none" stroke={cfg.accent} strokeWidth="0.8" strokeDasharray="2 4" />
              <circle cx="50" cy="50" r="44" fill="none" stroke={cfg.accent} strokeWidth="0.4" strokeDasharray="1 3" opacity="0.6" />
            </svg>

            {/* Chữ La Mã chạy quanh */}
            <svg viewBox="0 0 120 120" className={`absolute inset-0 w-full h-full halo-rotate ${cfg.romanCol}`} aria-hidden>
              <defs>
                <path id={orbitId} d="M 60,60 m -52,0 a 52,52 0 1,1 104,0 a 52,52 0 1,1 -104,0" />
              </defs>
              <text fontSize="6.5" fontWeight="700" fill="currentColor" letterSpacing="2" style={{ fontFamily: "Cinzel, Cormorant Garamond, serif" }}>
                <textPath href={`#${orbitId}`} startOffset="0">
                  {romanText.repeat(3)}
                </textPath>
              </text>
            </svg>

            {/* Tia sáng tỏa */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full halo-rotate opacity-40" aria-hidden>
              {Array.from({ length: 12 }).map((_, i) => (
                <line
                  key={i}
                  x1="50" y1="4" x2="50" y2="14"
                  stroke={cfg.accent}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  transform={`rotate(${i * 30} 50 50)`}
                />
              ))}
            </svg>

            {/* AVATAR LỚN — trung tâm */}
            <Avatar className={`relative h-[62%] w-[62%] ring-4 ${cfg.ring} shadow-[0_0_30px_-4px_currentColor] z-[1]`} style={{ color: cfg.accent }}>
              <AvatarImage src={row.avatar_url ?? undefined} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-foreground font-black text-lg md:text-2xl">
                {row.display_name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* TOP tag */}
          <div className={`mt-3 px-3.5 py-1 rounded-full text-[10px] md:text-xs font-black tracking-[0.2em] text-background shadow-lg ${cfg.tag}`}>
            TOP {rank}
          </div>

          <div className="mt-2 text-sm md:text-lg font-black text-white truncate max-w-full px-1 drop-shadow">
            {row.display_name}
          </div>

          <div className={`mt-2 flex items-center gap-1 font-black text-base md:text-xl ${cfg.text}`}>
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
