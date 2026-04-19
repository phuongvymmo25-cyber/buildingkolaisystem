import { createFileRoute, redirect } from "@tanstack/react-router";
import { SkillsPage } from "@/components/pages/SkillsPage";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/skills")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  component: SkillsPage,
});
