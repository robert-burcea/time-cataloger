
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { toast } from "sonner";

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

// Try to get environment variables
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://your-project-url.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key";

// Create a Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Wrapper functions for Supabase operations with better error handling for development
export const safeSupabaseOperation = async <T>(
  operation: () => Promise<T>,
  fallback: T,
  errorMessage = "Database operation failed"
): Promise<T> => {
  if (isDevelopment && !isSupabaseConfigured()) {
    // In development without proper Supabase config, return the fallback
    return fallback;
  }

  try {
    return await operation();
  } catch (error) {
    console.error(errorMessage, error);
    toast.error(errorMessage);
    return fallback;
  }
};

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return (
    import.meta.env.VITE_SUPABASE_URL !== undefined &&
    import.meta.env.VITE_SUPABASE_URL !==
      "https://your-project-url.supabase.co" &&
    import.meta.env.VITE_SUPABASE_ANON_KEY !== undefined &&
    import.meta.env.VITE_SUPABASE_ANON_KEY !== "your-anon-key"
  );
};
