// 🔴 CRITICAL SECURITY WARNING 🔴
// DO NOT EXPOSE YOUR SUPABASE KEYS IN CLIENT-SIDE CODE.
//
// The keys below are exposed to anyone who visits your website. This is a significant
// security risk. In a real-world application, you should use environment variables
// (e.g., process.env.REACT_APP_SUPABASE_URL) and a build process to handle these securely.
//
// For more info, see: https://supabase.com/docs/guides/getting-started/frameworks/react#environment-variables

// IMPORTANT: Replace these with your actual Supabase Project URL and Anon Key.
// You can find these in your Supabase project's dashboard under Settings > API.
export const SUPABASE_URL = 'https://sdgofjolmkoakhotbhfn.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkZ29mam9sbWtvYWtob3RiaGZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTkxOTQsImV4cCI6MjA3NjYzNTE5NH0.mffmY1BKC-j3jcqsbe6rOrcOZPCGKtQVj_PRT_T6798';

// The name of your database table for messages.
export const DB_TABLE = 'messages';

// ❗ BUCKET NAME MISMATCH IS A COMMON ERROR ❗
// The name of your Supabase Storage bucket for images.
// This value MUST EXACTLY MATCH the name of the bucket you created in the
// Supabase dashboard (under Storage > Buckets).
//
// Common mistakes:
// - Typo: `image` instead of `images`
// - Case sensitivity: `Images` instead of `images`
//
// Please double-check the name in your Supabase project. The error "Bucket not found"
// almost always means this name is incorrect.
export const STORAGE_BUCKET = 'images';