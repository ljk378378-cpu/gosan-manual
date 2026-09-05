import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "청곡 AI 업무시스템",
  description: "평가, 지도점검, 팀 운영, 인사노무 학습을 관리하는 청곡종합사회복지관 업무 허브",
  icons: {
    apple: '/inspection-2026-icon.png?v=3',
    icon: '/inspection-2026-icon.png?v=3',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full bg-gray-50">{children}</body>
    </html>
  );
}
