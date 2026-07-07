import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import Email from "next-auth/providers/nodemailer";
import { CredentialsSignin } from "next-auth";

class LegacyAccountError extends CredentialsSignin {
  code = "LegacyAccount";
}

class EmailNotVerifiedError extends CredentialsSignin {
  code = "EmailNotVerified";
}
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  clearFailedLoginAttempts,
  extractRequestContext,
  markAndCheckNewDevice,
  registerFailedLoginAttempt,
} from "@/lib/auth-security";
import { sendMagicLinkEmail, sendNewLoginAlertEmail, sendSuspiciousActivityEmail } from "@/lib/mail";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT ?? "587");
const smtpSecure = String(process.env.SMTP_SECURE ?? "").toLowerCase() === "true" || smtpPort === 465;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || "Do Grit <no-reply@dogritorquit.in>";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: authSecret,
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        const context = extractRequestContext(request.headers);

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ 
          where: { email },
          select: { id: true, email: true, passwordHash: true, emailVerified: true }
        });

        if (!user) return null;

        if (!user.passwordHash) {
          throw new LegacyAccountError("Legacy account detected. Please use 'Forgot Password' to set a new password.");
        }

        if (!user.emailVerified) {
          throw new EmailNotVerifiedError("Email not verified");
        }

        const valid = await compare(password, user.passwordHash);
        if (!valid) {
          const failed = await registerFailedLoginAttempt(email, context.ip);
          if (failed.shouldAlert) {
            await sendSuspiciousActivityEmail({
              email,
              reason: "Multiple failed password login attempts",
              time: new Date(),
              ip: context.ip,
              userAgent: context.userAgent,
              locationHint: context.locationHint,
            }).catch((error) => {
              console.error("Failed to send suspicious activity email:", error);
            });
          }
          return null;
        }

        await clearFailedLoginAttempts(email, context.ip);
        const isNewDevice = await markAndCheckNewDevice(user.id, context.fingerprint, {
          ip: context.ip,
          userAgent: context.userAgent,
          locationHint: context.locationHint,
        });
        if (isNewDevice) {
          await sendNewLoginAlertEmail({
            email,
            time: new Date(),
            ip: context.ip,
            userAgent: context.userAgent,
            locationHint: context.locationHint,
          }).catch((error) => {
            console.error("Failed to send new login alert email:", error);
          });
        }

        return {
          id: user.id,
          email: user.email,
          emailVerified: user.emailVerified,
        };
      },
    }),
    ...(smtpHost && smtpUser && smtpPass
      ? [
          Email({
            id: "email",
            maxAge: 10 * 60,
            server: {
              host: smtpHost,
              port: smtpPort,
              secure: smtpSecure,
              auth: {
                user: smtpUser,
                pass: smtpPass,
              },
            },
            from: smtpFrom,
            async sendVerificationRequest(params) {
              await sendMagicLinkEmail(params.identifier, params.url);
            },
          }),
        ]
      : []),
    ...(googleClientId && googleClientSecret
      ? [
          Google({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            allowDangerousEmailAccountLinking: true,
            authorization: { params: { prompt: "select_account" } },
          }),
        ]
      : []),
    ...(githubClientId && githubClientSecret
      ? [
          GitHub({
            clientId: githubClientId,
            clientSecret: githubClientSecret,
            allowDangerousEmailAccountLinking: true,
            authorization: { params: { prompt: "select_account", scope: "read:user user:email repo" } },
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      return true;
    },
    async jwt({ token, user, account }) {
      if (user?.id) {
        token.sub = user.id;
      }

      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : Date.now() + 60 * 60 * 1000,
          user,
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, try to update it
      try {
        if (!token.refreshToken) throw new Error("No refresh token");

        const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: token.refreshToken }),
        });

        const refreshedTokens = await response.json();

        if (!response.ok) throw refreshedTokens;

        return {
          ...token,
          accessToken: refreshedTokens.access_token,
          accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
          refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fallback to old refresh token
        };
      } catch (error) {
        console.error("Error refreshing access token", error);
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id: string }).id = token.sub;
      }
      (session as any).accessToken = token.accessToken;
      (session as any).error = token.error;
      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      if (!user?.email) return;
      if (account?.provider === "credentials") return;

      await sendNewLoginAlertEmail({
        email: user.email,
        time: new Date(),
        ip: null,
        userAgent: account?.provider ? `Provider: ${account.provider}` : null,
        locationHint: null,
      }).catch((error) => {
        console.error("Failed to send login alert email:", error);
      });
    },
    async createUser({ user }) {
      if (!user.id) return;
      
      // Initialize Profile and Stats for new user
      await prisma.$transaction([
        prisma.userProfile.create({
          data: {
            userId: user.id,
            name: user.name,
            avatarUrl: user.image,
          },
        }),
        prisma.userStats.create({
          data: {
            userId: user.id,
          },
        }),
      ]);
    },
  },
  pages: {
    signIn: "/login",
  },
});
