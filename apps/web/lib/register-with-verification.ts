import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { randomBytes, randomUUID } from "crypto";
import { sendVerificationEmail } from "@/lib/mail";

type RegisterInput = {
  email: string;
  password: string;
  name?: string | null;
};

export type RegisterWithVerificationResult =
  | { ok: true; status: 201 | 200; message: string; redirectedTo?: string }
  | { ok: false; status: number; error: string };

async function issueVerificationEmail(email: string) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  await sendVerificationEmail(email, token);
}

export async function registerWithVerification(
  input: RegisterInput
): Promise<RegisterWithVerificationResult> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const name = input.name?.trim() || null;

  if (!email || !password) {
    return { ok: false, status: 400, error: "Email and password are required" };
  }

  if (password.length < 8) {
    return { ok: false, status: 400, error: "Password must be at least 8 characters" };
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, emailVerified: true },
  });

  const passwordHash = await hash(password, 12);

  if (existing) {
    if (existing.emailVerified) {
      return { ok: false, status: 409, error: "Email already in use" };
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: existing.id },
        data: { passwordHash },
      }),
      prisma.userProfile.upsert({
        where: { userId: existing.id },
        create: {
          userId: existing.id,
          name,
        },
        update: {
          ...(name ? { name } : {}),
        },
      }),
      prisma.userStats.upsert({
        where: { userId: existing.id },
        create: { userId: existing.id },
        update: {},
      }),
    ]);

    await issueVerificationEmail(email);

    return {
      ok: true,
      status: 200,
      message: "Verification email sent. Please verify your account before signing in.",
      redirectedTo: "/auth/verify-request",
    };
  }

  const userId = randomUUID();
  await prisma.$transaction([
    prisma.user.create({
      data: {
        id: userId,
        email,
        passwordHash,
        tier: "Free Tier",
      },
    }),
    prisma.userProfile.create({
      data: {
        userId,
        name,
      },
    }),
    prisma.userStats.create({
      data: {
        userId,
      },
    }),
  ]);

  await issueVerificationEmail(email);

  return {
    ok: true,
    status: 201,
    message: "Verification email sent. Please verify your account before signing in.",
    redirectedTo: "/auth/verify-request",
  };
}
