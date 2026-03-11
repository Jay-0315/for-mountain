import type { Metadata } from "next";
import "./globals.css";
import ScrollProgressBar from "@/components/layout/ScrollProgressBar";
import PageIntro from "@/components/ui/PageIntro";
import CustomCursor from "@/components/ui/CustomCursor";

export const metadata: Metadata = {
  title: "株式会社マウンテン | ITエンジニアリング・ネットワーク通信機器",
  description:
    "株式会社マウンテンはITエンジニアのアウトソーシング、自社開発とネットワーク通信機器の製品開発と販売を両立する、IT総合カンパニーです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning data-scroll-behavior="smooth">
      <body suppressHydrationWarning className="antialiased">
        <PageIntro />
        <ScrollProgressBar />
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
