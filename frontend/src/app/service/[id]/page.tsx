import { permanentRedirect } from "next/navigation";
import { BASE_URL } from "@/lib/site";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/service-items`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch service static params");
    }

    const items = (await res.json()) as Array<{ id: number }>;
    return items.map((item) => ({ id: String(item.id) }));
  } catch {
    return [];
  }
}

export default async function LegacyServiceDetailPage({ params }: Props) {
  const { id } = await params;
  permanentRedirect(`/services/${id}`);
}
