import CredentialsProvider from "next-auth/providers/credentials";
import { findUserByEmail } from "./db";
import crypto from "crypto";
import { NextAuthOptions } from "next-auth";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter an email and password");
        }

        const user = await findUserByEmail(credentials.email.toLowerCase().trim());

        if (!user || !user.password) {
          throw new Error("No user found with this email");
        }

        const hashedPassword = hashPassword(credentials.password);
        if (user.password !== hashedPassword) {
          throw new Error("Incorrect password");
        }

        // Normalize RECRUITER to COMPANY
        let role = user.role || "STUDENT";
        if (role === "RECRUITER") role = "COMPANY";

        return {
          id: user.id || "",
          email: user.email,
          name: user.name,
          role,
          verificationStatus: user.verificationStatus || "PENDING",
          collegeName: user.collegeName || null,
          companyName: user.companyName || null,
          department: user.department || null,
        } as any;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (url.startsWith("/")) return url;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        // ignore invalid URL format
      }
      return url;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.verificationStatus = user.verificationStatus;
        token.collegeName = user.collegeName;
        token.companyName = user.companyName;
        token.department = user.department;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.verificationStatus = token.verificationStatus;
        session.user.collegeName = token.collegeName;
        session.user.companyName = token.companyName;
        session.user.department = token.department;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};
