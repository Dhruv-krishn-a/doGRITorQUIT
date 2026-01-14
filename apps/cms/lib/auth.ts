import { auth } from "@domain";

// Wrap it in a function to ensure type safety and proper execution context
export async function getAdminUser() {
  return auth.getAdminUser();
}