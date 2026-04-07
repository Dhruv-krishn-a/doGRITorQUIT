// packages/api/index.ts
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// --- SUPABASE HELPER ---
export function createSupabaseClient(url: string, anon: string) {
  return createClient(url, anon);
}

// --- SHARED AUTH SCHEMAS ---
export const SignUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

// --- SHARED TASK SCHEMAS ---
// Used by both Web forms and Mobile forms
export const CreateTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  // Allow string (ISO from JSON) or Date object
  date: z.union([z.string().datetime(), z.date()]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
});

export const UpdateTaskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
  status: z.enum(["pending", "in_progress", "completed", "archived"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
});

// --- TYPE EXPORTS ---
// Inferred types so you don't have to manually write interfaces
export type SignUpInput = z.infer<typeof SignUpSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;