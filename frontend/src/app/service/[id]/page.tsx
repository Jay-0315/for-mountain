import { permanentRedirect } from "next/navigation";
import { fetchServiceStaticParams } from "@/lib/static-params";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return fetchServiceStaticParams();
}

export default async function LegacyServiceDetailPage({ params }: Props) {
  const { id } = await params;
  permanentRedirect(`/services/${id}`);
}
