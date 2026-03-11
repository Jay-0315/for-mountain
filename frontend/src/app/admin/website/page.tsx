"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { PartnersTab, ServiceItemsTab, WebsiteTab } from "./tabs";

type WebsiteManageTab = "website" | "partners" | "services";

function WebsiteManageTabBar({
  active,
  onChange,
}: {
  active: WebsiteManageTab;
  onChange: (tab: WebsiteManageTab) => void;
}) {
  const tabs: { key: WebsiteManageTab; label: string }[] = [
    { key: "website", label: "ウェブサイトお知らせ" },
    { key: "partners", label: "協力会社カード" },
    { key: "services", label: "事業分野管理" },
  ];

  return (
    <div className="flex gap-1 rounded-xl bg-slate-100 p-1 w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            active === tab.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function WebsiteManagementPageContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<WebsiteManageTab>(
    initialTab === "partners" || initialTab === "services" ? initialTab : "website"
  );

  return (
    <div className="max-w-5xl space-y-5">
      <h2 className="text-lg font-bold text-slate-900">ウェブサイト管理</h2>
      <WebsiteManageTabBar active={activeTab} onChange={setActiveTab} />
      <div>
        {activeTab === "website" && <WebsiteTab />}
        {activeTab === "partners" && <PartnersTab />}
        {activeTab === "services" && <ServiceItemsTab />}
      </div>
    </div>
  );
}

export default function WebsiteManagementPage() {
  return (
    <Suspense fallback={<div className="max-w-5xl space-y-5"><h2 className="text-lg font-bold text-slate-900">ウェブサイト管理</h2></div>}>
      <WebsiteManagementPageContent />
    </Suspense>
  );
}
