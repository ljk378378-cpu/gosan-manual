import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ActivityPeriodProvider } from "@/components/ActivityPeriod";

export const metadata: Metadata = {
  title: "청곡 AI 업무시스템",
  description: "평가, 팀 운영, 인사노무 학습을 관리하는 청곡종합사회복지관 업무 허브",
  manifest: '/manifest.webmanifest',
  icons: {
    apple: '/cheonggok-ai-icon.png?v=3',
    icon: '/cheonggok-ai-icon.png?v=3',
  },
  appleWebApp: {
    capable: true,
    title: '청곡AI',
    statusBarStyle: 'black-translucent',
  },
};

export const viewport: Viewport = {
  themeColor: '#123c2c',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full bg-gray-50"><ActivityPeriodProvider>{children}</ActivityPeriodProvider></body>
    </html>
  );
}
