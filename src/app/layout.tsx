import type { Metadata } from "next";
import "./globals.css";
import AppProviders from "@/components/providers/AppProviders";

export const metadata: Metadata = {
  title: "Speed Reading PWA",
  description: "Mobile-first speed reading app with RSVP and normal reading modes."
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <AppProviders>{props.children}</AppProviders>
      </body>
    </html>
  );
}