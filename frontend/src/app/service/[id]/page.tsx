import { permanentRedirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default async function LegacyServiceDetailPage({ params }: Props) {
  const { id } = await params;
  permanentRedirect(`/services/${id}`);
}
