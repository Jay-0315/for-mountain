import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type NewsItem = {
  id: number;
  date: string;       // "YYYY-MM-DD"
  category: string;
  title: string;
  created_at: string;
};
