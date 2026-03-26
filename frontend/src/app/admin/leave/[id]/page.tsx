import LeaveDetailClient from "./LeaveDetailClient";

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function LeaveDetailPage() {
  return <LeaveDetailClient />;
}
