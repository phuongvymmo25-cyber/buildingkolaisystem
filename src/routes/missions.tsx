import { createFileRoute, redirect } from "@tanstack/react-router";
import { MissionsPage } from "@/components/pages/MissionsPage";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/missions")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  component: MissionsPage,
});
