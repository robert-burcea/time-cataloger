
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { toast } from "sonner";

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

// Try to get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// More descriptive error handling for missing environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  if (isDevelopment) {
    console.warn(
      "Running in development mode without Supabase environment variables. " +
      "The app will use local data storage."
    );
  } else {
    // In production, this is a fatal error
    console.error("Missing Supabase environment variables");
    
    // Only show toast in browser environment
    if (typeof window !== 'undefined') {
      toast.error(
        "Supabase configuration missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables."
      );
    }
  }
}

// Create a Supabase client with fallback values for development
export const supabase = createClient<Database>(
  supabaseUrl || "https://placeholder-url.supabase.co",
  supabaseAnonKey || "placeholder-key"
);

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return (
    !!supabaseUrl &&
    !!supabaseAnonKey &&
    supabaseUrl !== "https://placeholder-url.supabase.co" &&
    supabaseAnonKey !== "placeholder-key"
  );
};

// Wrapper functions for Supabase operations with better error handling for development
export const safeSupabaseOperation = async <T>(
  operation: () => Promise<T>,
  fallback: T,
  errorMessage = "Database operation failed"
): Promise<T> => {
  if (isDevelopment && !isSupabaseConfigured()) {
    // In development without proper Supabase config, return the fallback
    console.info("Using local fallback data (Supabase not configured)");
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
