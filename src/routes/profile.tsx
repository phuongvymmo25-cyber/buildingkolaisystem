import { createFileRoute, redirect } from "@tanstack/react-router";
import { ProfilePage } from "@/components/pages/ProfilePage";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/profile")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  component: ProfilePage,
});
