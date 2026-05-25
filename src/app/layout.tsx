import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "주민이 그린 고산 매뉴얼 제작",
  description: "주민이 만든 동네 자원순환, 3년의 기록과 실천 가이드 제작 관리",
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
