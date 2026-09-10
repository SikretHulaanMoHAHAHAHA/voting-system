import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./global.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "San Jose Del Monte Voting Portal | Roblox",
  description: "Official Voting Portal for San Jose Del Monte | Roblox",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`light ${geistSans.variable} ${geistMono.variable}`} style={{ colorScheme: 'light' }}>
      <body className="bg-[#fffdf5] text-slate-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}