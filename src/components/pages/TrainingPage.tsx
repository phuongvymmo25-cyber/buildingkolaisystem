import { useState } from "react";
import { Play, FileText, Calendar, Check, Copy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { toast } from "sonner";

const VIDEOS = [
  { key: "v1", title: "Cách mời 100 thành viên Zalo trong 1 tuần", duration: "12:34", phase: 1 },
  { key: "v2", title: "Script nhắn tin chốt đơn hiệu quả", duration: "8:21", phase: 1 },
  { key: "v3", title: "Xây trang bán hàng từ con số 0", duration: "15:42", phase: 1 },
  { key: "v4", title: "Bán hàng có hệ thống — chốt deal lớn", duration: "18:09", phase: 2 },
  { key: "v5", title: "Content viral: công thức 4 bước", duration: "10:55", phase: 2 },
  { key: "v6", title: "Xây team mini và phân chia hoa hồng", duration: "14:18", phase: 3 },
  { key: "v7", title: "Live stream chốt đơn hàng loạt", duration: "22:30", phase: 4 },
  { key: "v8", title: "Sprint cuối: bứt phá $1,000", duration: "16:45", phase: 4 },
];

const SCRIPTS = [
  { title: "Script mời thành viên Zalo", body: "Chào bạn! Mình đang chạy nhóm cộng đồng [chủ đề] với hơn X thành viên cùng học và bứt phá thu nhập. Bạn có muốn tham gia miễn phí không? — Link: ..." },
  { title: "Script nhắn tin bán hàng", body: "Chào [tên]! Mình thấy bạn quan tâm tới [chủ đề]. Hiện mình có giải pháp giúp [lợi ích cụ thể]. Trong 30s mình giải thích nhé: ..." },
  { title: "Template bài content viral", body: "🔥 Hôm qua mình vừa [kết quả cụ thể]. Bí quyết là 3 bước: 1️⃣ ... 2️⃣ ... 3️⃣ ... Comment '+' để mình gửi chi tiết!" },
  { title: "Checklist xây trang bán hàng", body: "✓ Headline rõ ràng (đối tượng + lợi ích)\n✓ 3 bằng chứng kết quả thật\n✓ FAQ 5–7 câu\n✓ CTA đậm + scarcity\n✓ Testimonial video\n✓ Timer + bonus" },
];

const LIVES = [
  { date: "T2 — 20:00", topic: "Khởi động pha 1: 7 ngày đầu tiên", status: "upcoming" as const },
  { date: "T4 — 20:00", topic: "Workshop: chốt 5 đơn đầu tiên", status: "upcoming" as const },
  { date: "T6 — 20:00", topic: "Q&A — sửa script bán hàng", status: "replay" as const },
];

export function TrainingPage() {
  const { user } = useAuth();
  const { profile, refetch } = useProfile();
  const [watched, setWatched] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    supabase.from("watched_videos").select("video_key").eq("user_id", user.id).then(({ data }) => {
      setWatched(new Set(data?.map((v) => v.video_key) ?? []));
    });
  }, [user]);

  const watchVideo = async (key: string) => {
    if (!user || watched.has(key)) return;
    await supabase.from("watched_videos").insert({ user_id: user.id, video_key: key });
    setWatched((s) => new Set([...s, key]));
    if (profile) {
      await supabase.from("profiles").update({ total_points: profile.total_points + 10 }).eq("id", user.id);
      refetch();
    }
    toast.success("+10 điểm!", { description: "Đã đánh dấu xem xong" });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">Huấn luyện</h1>
        <p className="text-sm text-muted-foreground mt-1">Video, script và lịch live hỗ trợ hành trình của bạn.</p>
      </div>

      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="bg-muted/50 w-full grid grid-cols-3">
          <TabsTrigger value="videos">Video học</TabsTrigger>
          <TabsTrigger value="scripts">Tài liệu & Script</TabsTrigger>
          <TabsTrigger value="lives">Lịch Live</TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {VIDEOS.map((v) => {
              const isWatched = watched.has(v.key);
              return (
                <Card key={v.key} className={`p-4 border bg-card/60 backdrop-blur transition ${isWatched ? "border-success/30" : "border-border hover:border-primary/40"}`}>
                  <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/30 to-card flex items-center justify-center mb-3 relative overflow-hidden">
                    <Play className="h-12 w-12 text-primary-foreground drop-shadow-lg" fill="currentColor" />
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-xs font-bold text-white">
                      {v.duration}
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm leading-snug">{v.title}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">Pha {v.phase}</div>
                    </div>
                    {isWatched ? (
                      <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-success bg-success/15 px-2 py-1 rounded">
                        <Check className="h-3 w-3" /> Đã xem
                      </span>
                    ) : (
                      <Button size="sm" onClick={() => watchVideo(v.key)} className="flex-shrink-0 bg-primary hover:bg-primary/90 h-7 text-xs">
                        Xem
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="scripts" className="mt-5">
          <div className="space-y-3">
            {SCRIPTS.map((s) => (
              <Card key={s.title} className="p-4 bg-card/60 backdrop-blur border-border">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold mb-1">{s.title}</div>
                    <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">{s.body}</pre>
                  </div>
                  <Button
                    size="sm" variant="outline" className="flex-shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(s.body);
                      toast.success("Đã sao chép!");
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="lives" className="mt-5">
          <div className="space-y-3">
            {LIVES.map((l) => (
              <Card key={l.topic} className="p-4 bg-card/60 backdrop-blur border-border flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm">{l.topic}</div>
                  <div className="text-xs text-muted-foreground">{l.date}</div>
                </div>
                <Button size="sm" className={l.status === "upcoming" ? "bg-gradient-primary" : ""} variant={l.status === "upcoming" ? "default" : "outline"}>
                  {l.status === "upcoming" ? "Tham gia" : "Xem lại"}
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
