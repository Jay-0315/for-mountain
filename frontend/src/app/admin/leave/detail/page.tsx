import { Suspense } from "react";
import LeaveDetailClient from "../[id]/LeaveDetailClient";

export default function LeaveDetailPage() {
  return (
    <Suspense fallback={null}>
      <LeaveDetailClient />
    </Suspense>
  );
}
