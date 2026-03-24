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
      <div className="rounded-2xl overflow-hidden border border-slate-100 bg-white shadow-sm">
        <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-300" />
        <div className="px-5 py-4">
          <h2 className="text-lg font-bold text-slate-900">ウェブサイト管理</h2>
          <p className="mt-0.5 text-sm text-slate-500">お知らせ・協力会社・事業分野の公開コンテンツを管理します。</p>
        </div>
      </div>
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
