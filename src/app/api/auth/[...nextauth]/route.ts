import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

console.log("[v0] NextAuth route loaded, providers:", authOptions.providers.map(p => p.id));

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
