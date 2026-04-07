"use server";

import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { sendPasswordResetEmail } from "@/lib/mail";
import { registerWithVerification } from "@/lib/register-with-verification";

export async function registerUser(data: any) {
  const { email, password, name } = data;

  try {
    const result = await registerWithVerification({ email, password, name });
    if (!result.ok) {
      return { error: result.error };
    }
    return { success: result.message, redirect: result.redirectedTo ?? "/auth/verify-request" };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function verifyEmail(token: string) {
  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken || verificationToken.expires < new Date()) {
      return { error: "Invalid or expired token" };
    }

    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      return { error: "User not found" };
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      }),
      prisma.verificationToken.delete({
        where: { token },
      }),
    ]);

    return { success: "Email verified successfully. You can now log in." };
  } catch (error) {
    console.error("Verification error:", error);
    return { error: "Something went wrong." };
  }
}

export async function forgotPassword(email: string) {
  if (!email) return { error: "Email is required" };

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return { success: "If an account exists, a reset link has been sent." };
    }

    const resetToken = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt: expires,
      },
    });

    await sendPasswordResetEmail(user.email, resetToken);

    return { success: "If an account exists, a reset link has been sent." };
  } catch (error) {
    console.error("Forgot password error:", error);
    return { error: "Something went wrong." };
  }
}

export async function resetPassword(token: string, password: any) {
  if (!token || !password) return { error: "Missing required fields" };

  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return { error: "Invalid or expired reset token" };
    }

    const passwordHash = await hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash, emailVerified: new Date() },
      }),
      prisma.passwordResetToken.deleteMany({
        where: { userId: resetToken.userId },
      }),
    ]);

    return { success: "Password reset successful. You can now log in." };
  } catch (error) {
    console.error("Reset password error:", error);
    return { error: "Something went wrong." };
  }
}
