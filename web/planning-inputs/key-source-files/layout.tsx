import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClubSettingsProvider } from '@/contexts/club-settings-context'
import { AuthProvider } from '@/contexts/auth-context'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pickleball Club Platform",
  description: "Multi-tenant pickleball club management platform with player management, match scheduling, and event organization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ClubSettingsProvider>
            {children}
          </ClubSettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}