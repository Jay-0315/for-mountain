import { permanentRedirect } from "next/navigation";
import { fetchNewsStaticParams } from "@/lib/static-params";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return fetchNewsStaticParams();
}

export default async function LegacyNoticeDetailPage({ params }: Props) {
  const { id } = await params;
  permanentRedirect(`/news/${id}`);
}
