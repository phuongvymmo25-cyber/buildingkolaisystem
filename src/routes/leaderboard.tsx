import { createFileRoute, redirect } from "@tanstack/react-router";
import { LeaderboardPage } from "@/components/pages/LeaderboardPage";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/leaderboard")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  component: LeaderboardPage,
});
