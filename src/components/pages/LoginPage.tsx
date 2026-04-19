import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useEffect } from "react";
import logo from "@/assets/logo.png";

export function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user, navigate]);

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Đăng nhập Google thất bại", { description: result.error.message });
      }
    } catch (e) {
      toast.error("Lỗi đăng nhập Google");
      console.error(e);
    }
    setLoading(false);
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Đăng ký thành công!", { description: "Hãy đăng nhập để bắt đầu hành trình 30 ngày." });
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Chào mừng trở lại!");
        navigate({ to: "/" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
      toast.error(mode === "signup" ? "Đăng ký thất bại" : "Đăng nhập thất bại", { description: msg });
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 70% 60% at 50% 0%, oklch(0.3 0.18 295 / 0.5), transparent 60%), linear-gradient(180deg, #0A0A0F 0%, #1A0A2E 100%)",
      }}
    >
      <div className="w-full max-w-md">
        <div className="bg-card/60 backdrop-blur-2xl border border-border rounded-3xl p-8 shadow-[0_30px_80px_-20px_oklch(0.55_0.24_295/0.4)]">
          <div className="text-center mb-7">
            <div className="inline-block relative mb-5">
              <div className="absolute inset-0 bg-primary/40 blur-3xl rounded-full" />
              <img src={logo} alt="KOL AI SYSTEM" width={88} height={88} className="relative drop-shadow-[0_0_30px_oklch(0.6_0.24_295/0.8)]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
              <span className="text-foreground">KOL AI </span>
              <span className="text-gradient-primary">SYSTEM</span>
            </h1>
            <p className="text-sm font-medium text-foreground/90">Hệ thống huấn luyện dòng tiền 30 ngày</p>
            <p className="text-xs text-muted-foreground mt-1">Dành cho KOL & Affiliate Việt Nam</p>
          </div>

          <Button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full bg-white text-gray-900 hover:bg-gray-100 rounded-xl h-12 font-medium shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Đăng nhập bằng Google
          </Button>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">hoặc dùng email</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            {mode === "signup" && (
              <div>
                <Label htmlFor="name" className="text-xs">Tên hiển thị</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Minh Anh" className="mt-1 bg-background/50" />
              </div>
            )}
            <div>
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ban@email.com" className="mt-1 bg-background/50" />
            </div>
            <div>
              <Label htmlFor="password" className="text-xs">Mật khẩu</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Tối thiểu 6 ký tự" className="mt-1 bg-background/50" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-primary hover:opacity-90 rounded-xl h-11 font-semibold">
              {loading ? "Đang xử lý..." : mode === "signup" ? "Tạo tài khoản" : "Đăng nhập"}
            </Button>
          </form>

          <div className="text-center mt-4 text-xs text-muted-foreground">
            {mode === "signin" ? (
              <>Chưa có tài khoản? <button onClick={() => setMode("signup")} className="text-primary font-semibold hover:underline">Đăng ký ngay</button></>
            ) : (
              <>Đã có tài khoản? <button onClick={() => setMode("signin")} className="text-primary font-semibold hover:underline">Đăng nhập</button></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
