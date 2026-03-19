import { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs';
import { verifyPassword, getUserByEmail } from "@/lib/auth-utils";
import { generateVerificationToken } from "@/lib/jwt-utils";
import { sendVerificationEmail } from "@/lib/email-service";


export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "User Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Default to user role if not specified
        const role = credentials.role || "user";

        if (role === "user") {
          // User authentication
          const user = await getUserByEmail(credentials.email);
          
          if (!user) {
            return null;
          }
          
          // Check if email is verified
          if (!user.emailVerified) {
            // Generate and send new verification token
            const token = generateVerificationToken({
              email: user.email,
              type: 'email_verification',
              role: 'user',
              userId: user.id
            });
            
            await sendVerificationEmail(user.email, token, user.name);
            
            throw new Error("Please verify your email. A new verification link has been sent.");
          }
          
          const isPasswordValid = await verifyPassword(
            credentials.password,
            user.password
          );
          
          if (!isPasswordValid) {
            return null;
          }
          
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: "user",
          };
        } else if (role === "owner") {
          // Owner authentication
          const owner = await prisma.owner.findUnique({
            where: { email: credentials.email },
          });
          
          if (!owner) {
            return null;
          }
          
          // Check if email is verified
          if (!owner.emailVerified) {
            // Generate and send new verification token
            const token = generateVerificationToken({
              email: owner.email,
              type: 'email_verification',
              role: 'owner',
              userId: owner.id
            });
            
            await sendVerificationEmail(owner.email, token, owner.name);
            
            throw new Error("Please verify your email. A new verification link has been sent.");
          }
          
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            owner.password
          );
          
          if (!isPasswordValid) {
            return null;
          }
          
          return {
            id: owner.id,
            name: owner.name,
            email: owner.email,
            role: "owner",
            isOnboarded: owner.isOnboarded,
          };
        }
        
        return null;
      }
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        
        // Add isOnboarded for owner role
        if (token.role === "owner") {
          session.user.isOnboarded = token.isOnboarded as boolean;
        }
      }
      return session;
    },
    async jwt({ token, user, trigger }) {
      // On initial sign-in, add custom properties to the token
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        if (user.role === "owner") {
          token.isOnboarded = user.isOnboarded;
        }
      }

      // On session update, refresh user data from database
      if (trigger === "update" && token.sub) {
        if (token.role === "user") {
          const user = await prisma.user.findUnique({
            where: { id: token.sub as string },
            select: { name: true, email: true },
          });
          if (user) {
            token.name = user.name;
            token.email = user.email;
          }
        } else if (token.role === "owner") {
          const owner = await prisma.owner.findUnique({
            where: { id: token.sub as string },
            select: { name: true, email: true, isOnboarded: true },
          });
          if (owner) {
            token.name = owner.name;
            token.email = owner.email;
            token.isOnboarded = owner.isOnboarded;
          }
        }
      }

      // On subsequent requests, refresh the token with the latest data (owner only, not every request)
      if (token.sub && token.role === "owner" && trigger === "update") {
        const owner = await prisma.owner.findUnique({
          where: { id: token.sub as string },
          select: { isOnboarded: true },
        });
        if (owner) {
          token.isOnboarded = owner.isOnboarded;
        }
      }

      return token;
    }
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};