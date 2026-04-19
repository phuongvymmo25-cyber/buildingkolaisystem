import { useEffect, useState } from "react";
import { Trophy, Lock, CheckCircle2, Sparkles, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { MILESTONES, getCurrentMilestoneIndex, todayVN } from "@/lib/missions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function IncomePage() {
  const { user } = useAuth();
  const { profile, refetch } = useProfile();
  const [showTrophy, setShowTrophy] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [justAchieved, setJustAchieved] = useState<number | null>(null);
  const [weekStats, setWeekStats] = useState({ completed: 0, points: 0 });

  const currentIdx = getCurrentMilestoneIndex(profile?.current_milestone ?? 0);
  const nextIdx = currentIdx + 1;

  const claim = async () => {
    if (!user || !profile || nextIdx >= MILESTONES.length) return;
    const m = MILESTONES[nextIdx];
    const { error } = await supabase.from("income_milestones").insert({
      user_id: user.id,
      milestone_amount: m.amount,
    });
    if (error) {
      toast.error("Không thể đánh dấu mốc");
      return;
    }
    await supabase.from("profiles").update({ current_milestone: m.amount }).eq("id", user.id);

    // weekly stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { data } = await supabase
      .from("daily_missions")
      .select("completed, points_awarded")
      .eq("user_id", user.id)
      .gte("date", weekAgo.toISOString().slice(0, 10))
      .lte("date", todayVN());
    setWeekStats({
      completed: data?.filter((r) => r.completed).length ?? 0,
      points: data?.reduce((s, r) => s + (r.points_awarded || 0), 0) ?? 0,
    });

    setJustAchieved(nextIdx);
    setShowTrophy(true);
    confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 }, colors: ["#F59E0B", "#7C3AED", "#10B981"] });
    setTimeout(() => {
      setShowTrophy(false);
      setShowSummary(true);
    }, 2800);
    refetch();
  };

  const shareText = () => {
    const m = justAchieved !== null ? MILESTONES[justAchieved] : MILESTONES[currentIdx];
    return `🎉 Tôi vừa đạt mốc $${m?.amount} — "${m?.title}" trong KOL AI SYSTEM! Hành trình 30 ngày bứt phá $1,000 đang tiếp tục 🔥 #KOLAISystem`;
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">Cấp độ dòng tiền</h1>
        <p className="text-sm text-muted-foreground mt-1">
          13 mốc thu nhập từ $1 đến $1,000 — chinh phục từng bước một.
        </p>
      </div>

      <Card className="p-5 bg-gradient-to-br from-primary/15 via-card to-gold/10 border-primary/30">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Mốc hiện tại</div>
        <div className="text-3xl font-black mt-1 text-gradient-gold">
          ${profile?.current_milestone ?? 0}
        </div>
        <div className="text-sm text-muted-foreground">
          {currentIdx >= 0 ? MILESTONES[currentIdx].title : "Bắt đầu hành trình"}
        </div>
      </Card>

      <div className="space-y-2">
        {MILESTONES.map((m, idx) => {
          const achieved = idx <= currentIdx;
          const isNext = idx === nextIdx;
          const isCurrent = idx === currentIdx;
          const isLegend = m.rank === "Legend";
          return (
            <Card
              key={m.amount}
              className={`p-4 border transition-all rounded-2xl ${
                isCurrent
                  ? "border-running bg-primary/10"
                  : isLegend
                  ? "bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 border-gold/50 animate-pulse-glow"
                  : achieved
                  ? "bg-success/8 border-success/30"
                  : isNext
                  ? "bg-primary/8 border-primary/40"
                  : "bg-card/60 border-border opacity-70"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-12 w-16 rounded-xl bg-gradient-to-br from-card to-muted border border-border/60 flex items-center justify-center font-black text-sm text-white shadow-lg">
                  ${m.amount}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold flex items-center gap-2 text-white">
                    {m.title}
                    {isLegend && <Sparkles className="h-4 w-4 text-gold" />}
                  </div>
                  <div className="text-xs text-muted-foreground">{m.rank}</div>
                </div>
                <div className="flex-shrink-0">
                  {achieved ? (
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  ) : isNext ? (
                    <Button onClick={claim} size="sm" className="bg-gradient-primary hover:opacity-90 font-bold">
                      Đánh dấu đạt
                    </Button>
                  ) : (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Trophy overlay */}
      <AnimatePresence>
        {showTrophy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="text-center"
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gold/40 blur-3xl rounded-full" />
                <Trophy className="relative h-40 w-40 text-gold drop-shadow-[0_0_40px_oklch(0.78_0.16_75/0.9)]" strokeWidth={1.5} />
              </div>
              <div className="mt-4 text-3xl font-black text-gradient-gold">
                ${justAchieved !== null ? MILESTONES[justAchieved]?.amount : ""}
              </div>
              <div className="text-lg font-bold text-foreground">
                {justAchieved !== null ? MILESTONES[justAchieved]?.title : ""}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="bg-card/95 backdrop-blur-xl border-primary/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-center">
              🎉 Tổng kết tuần này
            </DialogTitle>
            <DialogDescription className="text-center">
              Chúc mừng! Bạn đã đạt mốc <span className="font-bold text-gold">${justAchieved !== null ? MILESTONES[justAchieved]?.amount : ""}</span>!
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 py-3">
            <Stat label="Nhiệm vụ" value={weekStats.completed.toString()} />
            <Stat label="Điểm tuần" value={`+${weekStats.points}`} />
            <Stat label="Streak" value={`${profile?.streak ?? 0}🔥`} />
          </div>
          <p className="text-sm text-center text-muted-foreground">
            Tiếp tục chinh phục thử thách tiếp theo!
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(shareText());
                toast.success("Đã sao chép vào clipboard!");
              }}
            >
              <Share2 className="h-4 w-4 mr-2" /> Chia sẻ
            </Button>
            <Button onClick={() => setShowSummary(false)} className="bg-gradient-primary">
              Tiếp tục
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/50 p-3 text-center">
      <div className="text-xl font-black">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}
