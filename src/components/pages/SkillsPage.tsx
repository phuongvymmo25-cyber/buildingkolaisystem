import { useEffect, useState } from "react";
import { Flame, Target, Award } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { getLevelFromPoints, todayVN } from "@/lib/missions";
import { Card } from "@/components/ui/card";

interface DayPoints { date: string; points: number }

const BADGES = [
  { key: "connector", icon: "🔗", name: "Người kết nối", desc: "Mời 50+ thành viên Zalo tổng cộng" },
  { key: "seller", icon: "💰", name: "Người bán hàng", desc: "Chốt 10+ đơn tổng cộng" },
  { key: "builder", icon: "🌐", name: "Người xây trang", desc: "Hoàn thiện trang bán hàng" },
  { key: "persistent", icon: "🔥", name: "Người kiên trì", desc: "Streak 7 ngày liên tiếp" },
  { key: "star", icon: "⭐", name: "KOL nổi bật", desc: "Top 3 bảng xếp hạng" },
];

export function SkillsPage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [weeklyData, setWeeklyData] = useState<DayPoints[]>([]);
  const [tasksThisWeek, setTasksThisWeek] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState<Set<string>>(new Set());

  const points = profile?.total_points ?? 0;
  const level = getLevelFromPoints(points);
  const levelProgress = level.next ? ((points - level.min) / (level.next - level.min)) * 100 : 100;

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const days: string[] = [];
      const today = new Date(todayVN());
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().slice(0, 10));
      }

      const { data } = await supabase
        .from("daily_missions")
        .select("date, completed, points_awarded")
        .eq("user_id", user.id)
        .gte("date", days[0]);

      const byDate: Record<string, number> = {};
      let tasks = 0;
      data?.forEach((r) => {
        byDate[r.date] = (byDate[r.date] ?? 0) + (r.points_awarded || 0);
        if (r.completed) tasks++;
      });
      setWeeklyData(days.map((d) => ({ date: d, points: byDate[d] ?? 0 })));
      setTasksThisWeek(tasks);

      const { data: badges } = await supabase.from("badges").select("badge_key").eq("user_id", user.id);
      setEarnedBadges(new Set(badges?.map((b) => b.badge_key) ?? []));
    };
    load();
  }, [user, profile]);

  const maxPoints = Math.max(...weeklyData.map((d) => d.points), 10);
  const target = 25;
  const taskProgress = Math.min((tasksThisWeek / target) * 100, 100);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">Khung năng lực</h1>
        <p className="text-sm text-muted-foreground mt-1">Theo dõi tiến độ và huy hiệu của bạn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tasks ring */}
        <Card className="p-5 bg-card/60 backdrop-blur border-border">
          <div className="flex items-center gap-2 text-sm font-bold mb-3">
            <Target className="h-4 w-4 text-primary" /> Bộ đếm nhiệm vụ
          </div>
          <div className="relative inline-flex items-center justify-center mx-auto w-full">
            <svg viewBox="0 0 120 120" className="w-32 h-32 mx-auto -rotate-90">
              <circle cx="60" cy="60" r="50" fill="none" stroke="oklch(0.22 0.02 280)" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="50" fill="none"
                stroke="oklch(0.55 0.24 295)" strokeWidth="10"
                strokeDasharray={`${(taskProgress / 100) * 314} 314`}
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 8px oklch(0.55 0.24 295 / 0.6))" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl font-black">{tasksThisWeek}</div>
              <div className="text-[10px] text-muted-foreground">/ {target} tuần</div>
            </div>
          </div>
        </Card>

        {/* Streak */}
        <Card className="p-5 bg-card/60 backdrop-blur border-gold/30">
          <div className="flex items-center gap-2 text-sm font-bold mb-3">
            <Flame className="h-4 w-4 text-gold" /> Ngọn lửa streak
          </div>
          <div className="text-center py-4">
            <div className="text-7xl animate-fire inline-block">🔥</div>
            <div className="text-4xl font-black text-gradient-gold mt-2">{profile?.streak ?? 0}</div>
            <div className="text-xs text-muted-foreground">ngày liên tiếp</div>
          </div>
        </Card>

        {/* Level */}
        <Card className="p-5 bg-card/60 backdrop-blur border-border">
          <div className="flex items-center gap-2 text-sm font-bold mb-3">
            <Award className="h-4 w-4 text-primary" /> Điểm năng lực
          </div>
          <div className="text-3xl font-black text-gradient-primary">{points}</div>
          <div className="text-sm font-semibold mt-1">{level.name}</div>
          <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-primary" style={{ width: `${levelProgress}%` }} />
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            {level.next ? `${level.next - points} điểm để lên cấp` : "Cấp cao nhất!"}
          </div>
        </Card>
      </div>

      {/* Weekly bar chart */}
      <Card className="p-5 bg-card/60 backdrop-blur border-border">
        <div className="text-sm font-bold mb-4">Điểm 7 ngày qua</div>
        <div className="flex items-end justify-between gap-2 h-40">
          {weeklyData.map((d) => {
            const h = Math.max((d.points / maxPoints) * 100, 4);
            const day = new Date(d.date).toLocaleDateString("vi-VN", { weekday: "short" });
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="text-[10px] font-bold text-muted-foreground">{d.points}</div>
                <div className="w-full bg-muted rounded-t-md overflow-hidden" style={{ height: "100%" }}>
                  <div
                    className="w-full bg-gradient-to-t from-primary to-primary-glow rounded-t-md transition-all"
                    style={{ height: `${h}%`, marginTop: `${100 - h}%` }}
                  />
                </div>
                <div className="text-[10px] text-muted-foreground capitalize">{day}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Badges */}
      <div>
        <div className="text-sm font-bold mb-3">Huy hiệu kỹ năng</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {BADGES.map((b) => {
            const earned = earnedBadges.has(b.key);
            return (
              <Card
                key={b.key}
                className={`p-4 text-center border transition-all ${
                  earned
                    ? "bg-gradient-to-br from-gold/15 to-primary/10 border-gold/40 glow-gold"
                    : "bg-card/40 border-border opacity-60"
                }`}
              >
                <div className={`text-4xl mb-2 ${earned ? "" : "grayscale"}`}>{b.icon}</div>
                <div className="text-xs font-bold">{b.name}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{b.desc}</div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
