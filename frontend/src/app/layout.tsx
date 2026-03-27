import type { Metadata } from "next";
import "./globals.css";
import ScrollProgressBar from "@/components/layout/ScrollProgressBar";
import CustomCursor from "@/components/ui/CustomCursor";
import { BASE_URL, DEFAULT_OG_IMAGE, GOOGLE_SITE_VERIFICATION } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "株式会社マウンテン | ITエンジニアリング・ネットワーク通信機器",
    template: "%s | 株式会社マウンテン",
  },
  description:
    "株式会社マウンテンはITエンジニアのアウトソーシング、自社開発とネットワーク通信機器の製品開発と販売を両立する、IT総合カンパニーです。",
  keywords: [
    "株式会社マウンテン",
    "ITエンジニア",
    "アウトソーシング",
    "ネットワーク通信機器",
    "システム開発",
    "IT総合カンパニー",
  ],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: BASE_URL,
    siteName: "株式会社マウンテン",
    title: "株式会社マウンテン | ITエンジニアリング・ネットワーク通信機器",
    description:
      "株式会社マウンテンはITエンジニアのアウトソーシング、自社開発とネットワーク通信機器の製品開発と販売を両立する、IT総合カンパニーです。",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "株式会社マウンテン",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "株式会社マウンテン | ITエンジニアリング・ネットワーク通信機器",
    description:
      "株式会社マウンテンはITエンジニアのアウトソーシング、自社開発とネットワーク通信機器の製品開発と販売を両立する、IT総合カンパニーです。",
    images: [DEFAULT_OG_IMAGE],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: BASE_URL },
  verification: {
    google: GOOGLE_SITE_VERIFICATION,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "株式会社マウンテン",
  url: BASE_URL,
  description:
    "ITエンジニアのアウトソーシング、自社開発とネットワーク通信機器の製品開発・販売を行うIT総合カンパニー。",
  address: {
    "@type": "PostalAddress",
    addressCountry: "JP",
  },
  sameAs: [],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning className="antialiased">
        <ScrollProgressBar />
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
