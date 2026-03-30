import { permanentRedirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default async function LegacyNoticeDetailPage({ params }: Props) {
  const { id } = await params;
  permanentRedirect(`/news/${id}`);
}
