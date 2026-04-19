import { useEffect, useState, useCallback } from "react";
import confetti from "canvas-confetti";
import { Check, Star, Trophy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import {
  getPhaseFromDay,
  PHASE_INFO,
  getTodayMissions,
  todayVN,
  type MissionDef,
} from "@/lib/missions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface MissionState {
  completed: boolean;
  quantity_logged: number;
  points_awarded: number;
}

export function MissionsPage() {
  const { user } = useAuth();
  const { profile, refetch } = useProfile();
  const day = profile?.day_number ?? 1;
  const phase = getPhaseFromDay(day);
  const phaseInfo = PHASE_INFO[phase];
  const missions = getTodayMissions(day);
  const date = todayVN();

  const [states, setStates] = useState<Record<string, MissionState>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("daily_missions")
      .select("mission_key, completed, quantity_logged, points_awarded")
      .eq("user_id", user.id)
      .eq("date", date);
    const m: Record<string, MissionState> = {};
    data?.forEach((r) => {
      m[r.mission_key] = {
        completed: r.completed,
        quantity_logged: r.quantity_logged,
        points_awarded: r.points_awarded,
      };
    });
    setStates(m);
    setLoading(false);
  }, [user, date]);

  useEffect(() => { load(); }, [load]);

  const upsert = async (mission: MissionDef, partial: Partial<MissionState>) => {
    if (!user) return;
    const current = states[mission.key] || { completed: false, quantity_logged: 0, points_awarded: 0 };
    const next = { ...current, ...partial };

    // If just completed, award full points
    const wasCompleted = current.completed;
    const nowCompleted = next.completed;
    let pointsDelta = 0;
    if (!wasCompleted && nowCompleted) {
      next.points_awarded = mission.points;
      pointsDelta = mission.points;
    } else if (wasCompleted && !nowCompleted) {
      pointsDelta = -current.points_awarded;
      next.points_awarded = 0;
    }

    setStates((s) => ({ ...s, [mission.key]: next }));

    const { error } = await supabase.from("daily_missions").upsert(
      {
        user_id: user.id,
        date,
        mission_key: mission.key,
        completed: next.completed,
        quantity_logged: next.quantity_logged,
        points_awarded: next.points_awarded,
      },
      { onConflict: "user_id,date,mission_key" }
    );
    if (error) {
      toast.error("Không thể lưu nhiệm vụ");
      return;
    }

    if (pointsDelta !== 0 && profile) {
      const newTotal = Math.max(0, profile.total_points + pointsDelta);
      await supabase.from("profiles").update({ total_points: newTotal, last_active_date: date }).eq("id", user.id);

      // Streak handling on first completion of the day
      if (!wasCompleted && nowCompleted) {
        await maybeUpdateStreak();
      }
      refetch();
    }

    if (!wasCompleted && nowCompleted) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#7C3AED", "#F59E0B", "#10B981"],
      });
      toast.success(`+${mission.points} điểm!`, { description: mission.name });
    }
  };

  const maybeUpdateStreak = async () => {
    if (!user || !profile) return;
    const last = profile.last_active_date;
    if (last === date) return; // already counted today
    const newStreak = (() => {
      if (!last) return 1;
      const lastD = new Date(last);
      const today = new Date(date);
      const diff = Math.floor((today.getTime() - lastD.getTime()) / 86400000);
      if (diff === 1) return profile.streak + 1;
      if (diff === 0) return profile.streak;
      return 1;
    })();
    await supabase.from("profiles").update({ streak: newStreak }).eq("id", user.id);
  };

  if (loading) {
    return <div className="space-y-3">{[0,1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}</div>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">Nhiệm vụ hôm nay</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ngày {day}/30 • <span className={phaseInfo.textClass}>{phaseInfo.name}</span>
        </p>
      </div>

      <div className="space-y-3">
        {missions.map((m) => {
          const st = states[m.key] || { completed: false, quantity_logged: 0, points_awarded: 0 };
          return (
            <Card
              key={m.key}
              className={`p-4 md:p-5 border transition-all ${
                st.completed
                  ? "bg-success/10 border-success/40"
                  : "bg-card/60 backdrop-blur border-border hover:border-primary/40"
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => upsert(m, { completed: !st.completed, quantity_logged: !st.completed ? Math.max(st.quantity_logged, m.quota) : st.quantity_logged })}
                  className={`flex-shrink-0 h-7 w-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                    st.completed
                      ? "bg-success border-success"
                      : "border-border hover:border-primary"
                  }`}
                  aria-label="Đánh dấu hoàn thành"
                >
                  {st.completed && <Check className="h-4 w-4 text-success-foreground" strokeWidth={3} />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xl">{m.icon}</span>
                        <span className={`font-bold ${st.completed ? "line-through opacity-70" : ""}`}>{m.name}</span>
                        {m.priority && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gold/20 text-gold flex items-center gap-0.5">
                            <Star className="h-2.5 w-2.5 fill-current" /> Ưu tiên #{m.priority}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{m.description}</p>
                    </div>
                    <div className="flex-shrink-0 px-2 py-1 rounded-md bg-primary/15 text-primary text-xs font-bold">
                      +{m.points}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={9999}
                      value={st.quantity_logged}
                      onChange={(e) => upsert(m, { quantity_logged: parseInt(e.target.value) || 0 })}
                      className="h-9 w-24 bg-background/60 text-sm"
                      placeholder="0"
                    />
                    <span className="text-xs text-muted-foreground">
                      / {m.quota} {m.unit}
                    </span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden ml-2">
                      <div
                        className={`h-full transition-all ${st.completed ? "bg-success" : "bg-primary"}`}
                        style={{ width: `${Math.min((st.quantity_logged / m.quota) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-4 bg-gradient-to-br from-primary/15 to-gold/10 border-primary/30">
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-gold" />
          <div className="text-sm">
            <div className="font-bold">Mẹo chiến thắng</div>
            <div className="text-muted-foreground">Tập trung làm nhiệm vụ ưu tiên #1, #2, #3 trước. Đừng bỏ ngày — streak là sức mạnh!</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
