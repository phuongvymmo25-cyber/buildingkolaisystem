import { createFileRoute, redirect } from "@tanstack/react-router";
import { IncomePage } from "@/components/pages/IncomePage";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/income")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  component: IncomePage,
});
