import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { TenantProvider } from "@/contexts/TenantContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Winksy.ai - AI Lash Extension App",
  description: "Free AI-powered app connecting lash professionals with consumers. Get celebrity lash matches, book appointments, and earn rewards!",
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Winksy.ai"
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    title: "Winksy.ai - AI Lash Extension App",
    description: "Free AI-powered app for lash extensions. Get celebrity matches, book appointments, earn rewards!",
    url: "https://winksy.ai",
    siteName: "Winksy.ai",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Winksy.ai - AI Lash Extension App",
    description: "Free AI-powered app for lash extensions",
    images: ["/twitter-image.svg"]
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#a855f7"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TenantProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </TenantProvider>
      </body>
    </html>
  );
}
