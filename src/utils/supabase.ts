
import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/database.types";

// Since we can't use environment variables in Lovable directly,
// we will initialize the client in a way that allows for easy configuration
// later through Supabase integration

// This will be replaced with actual values when connected to Supabase
const supabaseUrl = "https://your-supabase-url.supabase.co";
const supabaseAnonKey = "your-supabase-anon-key";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
