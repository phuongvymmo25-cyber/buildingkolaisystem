import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Flame, Zap, CheckCircle2, DollarSign, ArrowRight, Trophy } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  getPhaseFromDay,
  PHASE_INFO,
  getCurrentMilestone,
  getNextMilestone,
  getTodayMissions,
  getLevelFromPoints,
  todayVN,
} from "@/lib/missions";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import heroBanner from "@/assets/hero-banner.png";

interface DayPoints { date: string; points: number }

const BADGES = [
  { key: "connector", icon: "🔗", name: "Người kết nối", desc: "Mời 50+ Zalo" },
  { key: "seller", icon: "💰", name: "Người bán hàng", desc: "Chốt 10+ đơn" },
  { key: "builder", icon: "🌐", name: "Người xây trang", desc: "Hoàn thiện trang bán" },
  { key: "persistent", icon: "🔥", name: "Người kiên trì", desc: "Streak 7 ngày" },
  { key: "star", icon: "⭐", name: "KOL nổi bật", desc: "Top 3 vinh danh" },
];

export function Dashboard() {
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const [todayPoints, setTodayPoints] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);
  const [weeklyData, setWeeklyData] = useState<DayPoints[]>([]);
  const [tasksThisWeek, setTasksThisWeek] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState<Set<string>>(new Set());

  const day = profile?.day_number ?? 1;
  const phase = getPhaseFromDay(day);
  const phaseInfo = PHASE_INFO[phase];
  const totalToday = getTodayMissions(day).length;
  const current = getCurrentMilestone(profile?.current_milestone ?? 0);
  const next = getNextMilestone(profile?.current_milestone ?? 0);

  const points = profile?.total_points ?? 0;
  const level = getLevelFromPoints(points);
  const levelProgress = level.next ? ((points - level.min) / (level.next - level.min)) * 100 : 100;

  useEffect(() => {
    if (!user) return;
    supabase
      .from("daily_missions")
      .select("completed, points_awarded")
      .eq("user_id", user.id)
      .eq("date", todayVN())
      .then(({ data }) => {
        if (!data) return;
        setCompletedToday(data.filter((m) => m.completed).length);
        setTodayPoints(data.reduce((s, m) => s + (m.points_awarded || 0), 0));
      });

    const loadWeek = async () => {
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
    loadWeek();
  }, [user, profile]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  const milestoneProgress = next && current
    ? ((profile!.current_milestone - current.amount) / (next.amount - current.amount)) * 100
    : next
      ? (profile!.current_milestone / next.amount) * 100
      : 100;

  const maxPoints = Math.max(...weeklyData.map((d) => d.points), 10);
  const target = 25;
  const taskProgress = Math.min((tasksThisWeek / target) * 100, 100);

  return (
    <div className="relative">
      {/* Hero banner làm NỀN mờ ở dưới — tạo cảm xúc */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-0 overflow-hidden"
      >
        <img
          src={heroBanner}
          alt=""
          className="absolute inset-x-0 bottom-0 w-full object-cover opacity-[0.18] blur-[2px]"
          style={{ maskImage: "linear-gradient(to top, black 20%, transparent 95%)", WebkitMaskImage: "linear-gradient(to top, black 20%, transparent 95%)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background/80" />
      </div>

      <div className="relative z-10 space-y-6">
        {/* Greeting — info LÊN TRÊN */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Chào, <span className="text-gradient-primary">{profile?.display_name}</span> 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Cùng chinh phục thử thách hôm nay nhé!</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {current && (
              <div className="px-3 py-1.5 rounded-xl bg-gold/15 border border-gold/30 text-gold text-xs md:text-sm font-bold flex items-center gap-2">
                <Trophy className="h-4 w-4" /> ${current.amount} • {current.title}
              </div>
            )}
            <div className="px-3 py-1.5 rounded-xl bg-primary/15 border border-primary/30 text-primary font-bold text-xs md:text-sm">
              Ngày {day}/30
            </div>
          </div>
        </div>

        {/* Phase banner */}
        <div className={`rounded-2xl p-5 border ${phaseInfo.bgClass} ${phaseInfo.borderClass} relative overflow-hidden backdrop-blur-sm`}>
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20" style={{ backgroundColor: `var(--${phaseInfo.color})` }} />
          <div className="relative">
            <div className={`text-xs font-bold uppercase tracking-wider ${phaseInfo.textClass}`}>Pha hiện tại</div>
            <div className="text-xl md:text-2xl font-black mt-1">{phaseInfo.name}</div>
            <div className="text-sm text-muted-foreground mt-2">
              Tập trung vào nhiệm vụ ưu tiên #1, #2, #3 mỗi ngày để tối đa hoá kết quả.
            </div>
          </div>
        </div>

        {/* 4 metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <MetricCard icon={<Flame className="h-5 w-5" />} label="Streak" value={`${profile?.streak ?? 0}`} suffix="ngày" color="gold" iconAnim />
          <MetricCard icon={<Zap className="h-5 w-5" />} label="Điểm hôm nay" value={`+${todayPoints}`} color="primary" />
          <MetricCard icon={<CheckCircle2 className="h-5 w-5" />} label="Nhiệm vụ" value={`${completedToday}/${totalToday}`} color="success" />
          <MetricCard icon={<DollarSign className="h-5 w-5" />} label="Mốc hiện tại" value={current ? `$${current.amount}` : "$0"} color="gold" />
        </div>

        {/* Progress */}
        <Card className="p-5 bg-card/70 backdrop-blur border-border">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-muted-foreground">Tiến độ mốc dòng tiền</div>
              <div className="text-lg font-bold mt-0.5">
                ${profile?.current_milestone ?? 0} → ${next?.amount ?? 1000}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Mốc tiếp theo</div>
              <div className="text-sm font-semibold">{next?.title ?? "Đã chinh phục đỉnh!"}</div>
            </div>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary via-primary-glow to-gold transition-all duration-700"
              style={{ width: `${Math.min(Math.max(milestoneProgress, 4), 100)}%` }}
            />
          </div>
        </Card>

        {/* Quick CTA */}
        <Link
          to="/missions"
          className="block group rounded-2xl bg-gradient-primary p-5 md:p-6 shadow-[0_20px_60px_-15px_oklch(0.55_0.24_295/0.5)] hover:shadow-[0_25px_80px_-15px_oklch(0.55_0.24_295/0.7)] transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-primary-foreground/80 text-xs font-medium uppercase tracking-wider">Tiếp theo</div>
              <div className="text-primary-foreground text-lg md:text-xl font-bold mt-1">
                Hoàn thành {Math.max(totalToday - completedToday, 0)} nhiệm vụ còn lại
              </div>
            </div>
            <ArrowRight className="h-7 w-7 text-primary-foreground group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* ============ KHUNG NĂNG LỰC (gộp vào trang chủ) ============ */}
        <div className="pt-2">
          <h2 className="text-xl md:text-2xl font-black tracking-tight">Khung năng lực</h2>
          <p className="text-sm text-muted-foreground mt-1">Theo dõi tiến độ và huy hiệu của bạn.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 bg-card/70 backdrop-blur border-border">
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

          <Card className="p-5 bg-card/70 backdrop-blur border-gold/30">
            <div className="flex items-center gap-2 text-sm font-bold mb-3">
              <Flame className="h-4 w-4 text-gold" /> Ngọn lửa streak
            </div>
            <div className="text-center py-4">
              <div className="text-7xl animate-fire inline-block">🔥</div>
              <div className="text-4xl font-black text-gradient-gold mt-2">{profile?.streak ?? 0}</div>
              <div className="text-xs text-muted-foreground">ngày liên tiếp</div>
            </div>
          </Card>

          <Card className="p-5 bg-card/70 backdrop-blur border-border">
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
        <Card className="p-5 bg-card/70 backdrop-blur border-border">
          <div className="text-sm font-bold mb-4">Điểm 7 ngày qua</div>
          <div className="flex items-end justify-between gap-2 h-40">
            {weeklyData.map((d) => {
              const h = Math.max((d.points / maxPoints) * 100, 4);
              const dayLbl = new Date(d.date).toLocaleDateString("vi-VN", { weekday: "short" });
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="text-[10px] font-bold text-muted-foreground">{d.points}</div>
                  <div className="w-full bg-muted rounded-t-md overflow-hidden" style={{ height: "100%" }}>
                    <div
                      className="w-full bg-gradient-to-t from-primary to-primary-glow rounded-t-md transition-all"
                      style={{ height: `${h}%`, marginTop: `${100 - h}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground capitalize">{dayLbl}</div>
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
    </div>
  );
}

function MetricCard({
  icon, label, value, suffix, color, iconAnim,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  suffix?: string;
  color: "primary" | "gold" | "success";
  iconAnim?: boolean;
}) {
  const colorMap = {
    primary: "text-primary bg-primary/15",
    gold: "text-gold bg-gold/15",
    success: "text-success bg-success/15",
  };
  return (
    <Card className="p-4 bg-card/70 backdrop-blur border-border hover:border-primary/40 transition">
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${colorMap[color]} ${iconAnim ? "animate-fire" : ""}`}>
        {icon}
      </div>
      <div className="mt-3 text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-black mt-0.5">
        {value} {suffix && <span className="text-xs font-medium text-muted-foreground">{suffix}</span>}
      </div>
    </Card>
  );
}
