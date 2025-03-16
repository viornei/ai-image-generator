import { createClient } from "@supabase/supabase-js";

const siteURL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const redirectURI = `${siteURL}/auth/callback`;

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export { supabase, redirectURI };
