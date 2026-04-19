import { useState, useRef } from "react";
import { Camera, Save, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export function ProfilePage() {
  const { user, signOut } = useAuth();
  const { profile, refetch } = useProfile();
  const [name, setName] = useState(profile?.display_name ?? "");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Sync name when profile loads
  if (profile && name === "" && profile.display_name) {
    setName(profile.display_name);
  }

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ display_name: name }).eq("id", user.id);
    if (error) toast.error("Không lưu được");
    else {
      toast.success("Đã lưu!");
      refetch();
    }
    setSaving(false);
  };

  const upload = async (file: File) => {
    if (!user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh tối đa 5MB");
      return;
    }
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (error) {
      toast.error("Upload thất bại", { description: error.message });
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = `${publicUrl}?t=${Date.now()}`;
    await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
    toast.success("Đã cập nhật ảnh đại diện!");
    refetch();
  };

  return (
    <div className="space-y-5 max-w-xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">Hồ sơ của tôi</h1>
        <p className="text-sm text-muted-foreground mt-1">Cập nhật thông tin cá nhân.</p>
      </div>

      <Card className="p-6 bg-card/60 backdrop-blur border-border">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar className="h-28 w-28 ring-4 ring-primary/30">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-primary/20 text-primary text-3xl font-black">
                {profile?.display_name?.slice(0, 2).toUpperCase() ?? "K"}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg hover:scale-110 transition"
            >
              <Camera className="h-4 w-4 text-primary-foreground" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }}
            />
          </div>

          <div className="w-full space-y-3">
            <div>
              <Label htmlFor="dn" className="text-xs">Tên hiển thị</Label>
              <Input id="dn" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 bg-background/60" />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input value={user?.email ?? ""} disabled className="mt-1 bg-background/30" />
            </div>
            <Button onClick={save} disabled={saving} className="w-full bg-gradient-primary">
              <Save className="h-4 w-4 mr-2" /> {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-card/60 border-border">
        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat label="Ngày" value={`${profile?.day_number ?? 0}/30`} />
          <Stat label="Streak" value={`${profile?.streak ?? 0}🔥`} />
          <Stat label="Điểm" value={`${profile?.total_points ?? 0}`} />
        </div>
      </Card>

      <Button
        variant="outline"
        onClick={async () => { await signOut(); navigate({ to: "/login" }); }}
        className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
      >
        <LogOut className="h-4 w-4 mr-2" /> Đăng xuất
      </Button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/40 p-3">
      <div className="text-xl font-black">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
