
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { toast } from "sonner";

// Dummy client that won't be used
export const supabase = createClient<Database>(
  "https://example.supabase.co",
  "dummy-key"
);

// Set to always return false to disable Supabase operations
export const isSupabaseConfigured = (): boolean => {
  return false;
};

// Wrapper function that always uses the fallback
export const safeSupabaseOperation = async <T>(
  operation: () => Promise<T>,
  fallback: T,
  errorMessage = "Database operation failed"
): Promise<T> => {
  console.info("Using local storage (Supabase integration disabled)");
  return fallback;
};
