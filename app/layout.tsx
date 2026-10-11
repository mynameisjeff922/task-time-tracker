import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// next/font downloads the font at build time and serves it from our own site (no layout shift).
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  // Child pages set their own title, e.g. "Tasks" becomes "Tasks | Task Time Tracker".
  title: { template: "%s | Task Time Tracker", default: "Task Time Tracker" },
  description: "A to-do list that also tracks how much time you spend on each task and training.",
};

// The root layout only sets up <html> and <body>. The nav bar lives in app/(main)/layout.tsx,
// so the login page can have a clean, centered layout of its own.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
