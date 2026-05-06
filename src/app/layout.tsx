import type { Metadata } from "next";
import { Inter, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });
const libreBaskerville = Libre_Baskerville({ 
  weight: ['400', '700'],
  subsets: ["latin"],
  style: ['italic', 'normal'],
  variable: '--font-libre-baskerville'
});

export const metadata: Metadata = {
  title: "FinPulse",
  description: "Finance Intelligence Hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${libreBaskerville.variable}`} style={{ margin: 0, padding: 0, background: "#f4f7f9", minHeight: "100vh" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
