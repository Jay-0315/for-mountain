import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ServicesSection from "@/components/sections/ServicesSection";
import type { ServiceCategoryDto, ServiceItemDto } from "@/lib/api";
import { BASE_URL, withTrailingSlash } from "@/lib/site";

export const metadata: Metadata = {
  title: "事業内容",
  description:
    "株式会社マウンテンの事業内容。システム開発、ソリューション販売・技術支援、インフラ構築・技術支援、コンサルなど幅広い事業をご紹介します。",
  alternates: { canonical: withTrailingSlash("/services") },
};

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }

  return response.json() as Promise<T>;
}

export default async function ServicesPage() {
  let categories: ServiceCategoryDto[] = [];
  let items: ServiceItemDto[] = [];

  try {
    [categories, items] = await Promise.all([
      fetchJson<ServiceCategoryDto[]>("/api/v1/service-categories"),
      fetchJson<ServiceItemDto[]>("/api/v1/service-items"),
    ]);
  } catch {
    categories = [];
    items = [];
  }

  return (
    <>
      <Header />
      <main className="pt-20">
        <ServicesSection initialCategories={categories} initialItems={items} />
      </main>
      <Footer />
    </>
  );
}
