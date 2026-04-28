import type { Metadata } from "next";
import "./globals.css";
import ScrollProgressBar from "@/components/layout/ScrollProgressBar";
import {
  BASE_URL,
  COMPANY_ADDRESS_LOCALITY,
  COMPANY_ADDRESS_REGION,
  COMPANY_NAME_EN,
  COMPANY_NAME_JA,
  COMPANY_PHONE,
  COMPANY_POSTAL_CODE,
  COMPANY_STREET_ADDRESS,
  DEFAULT_OG_IMAGE,
  GOOGLE_SITE_VERIFICATION,
  withTrailingSlash,
} from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "株式会社マウンテン | ITエンジニアリング・ネットワーク通信機器",
    template: "%s | 株式会社マウンテン",
  },
  description:
    "株式会社マウンテンは東京都千代田区岩本町を拠点に、システム開発、ソリューション販売・技術支援、インフラ構築・技術支援、コンサルを提供するIT総合カンパニーです。",
  keywords: [
    COMPANY_NAME_JA,
    COMPANY_NAME_EN,
    "ITエンジニア",
    "アウトソーシング",
    "ネットワーク通信機器",
    "システム開発",
    "SES",
    "岩本町",
    "千代田区",
    "IT総合カンパニー",
  ],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: BASE_URL,
    siteName: COMPANY_NAME_JA,
    title: "株式会社マウンテン | ITエンジニアリング・ネットワーク通信機器",
    description:
      "株式会社マウンテンは東京都千代田区岩本町を拠点に、システム開発、ソリューション販売・技術支援、インフラ構築・技術支援、コンサルを提供するIT総合カンパニーです。",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: COMPANY_NAME_JA,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "株式会社マウンテン | ITエンジニアリング・ネットワーク通信機器",
    description:
      "株式会社マウンテンは東京都千代田区岩本町を拠点に、システム開発、ソリューション販売・技術支援、インフラ構築・技術支援、コンサルを提供するIT総合カンパニーです。",
    images: [DEFAULT_OG_IMAGE],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: withTrailingSlash("/") },
  verification: {
    google: GOOGLE_SITE_VERIFICATION,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: COMPANY_NAME_JA,
  alternateName: [COMPANY_NAME_EN, "マウンテン"],
  url: BASE_URL,
  logo: DEFAULT_OG_IMAGE,
  description:
    "東京都千代田区岩本町を拠点に、システム開発、ソリューション販売・技術支援、インフラ構築・技術支援、コンサルを提供するIT総合カンパニー。",
  telephone: COMPANY_PHONE,
  address: {
    "@type": "PostalAddress",
    postalCode: COMPANY_POSTAL_CODE,
    addressRegion: COMPANY_ADDRESS_REGION,
    addressLocality: COMPANY_ADDRESS_LOCALITY,
    streetAddress: COMPANY_STREET_ADDRESS,
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
        {children}
      </body>
    </html>
  );
}
