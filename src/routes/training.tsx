import { createFileRoute, redirect } from "@tanstack/react-router";
import { TrainingPage } from "@/components/pages/TrainingPage";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/training")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  component: TrainingPage,
});
