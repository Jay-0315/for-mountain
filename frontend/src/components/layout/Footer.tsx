"use client";

import Link from "next/link";
import GridRunnerBackdrop from "@/components/ui/GridRunnerBackdrop";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-slate-900 py-12 text-slate-400">
      <GridRunnerBackdrop />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <p className="text-white text-lg font-bold mb-2">
              <span className="text-orange-400">株式会社</span>マウンテン
            </p>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              ITエンジニアのアウトソーシング、自社開発と<br />
              ネットワーク通信機器の製品開発・販売を両立する<br />
              IT総合カンパニーです。
            </p>
          </div>

          <div className="flex gap-12">
            <div>
              <p className="text-white text-sm font-semibold mb-3">サイトマップ</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-white transition-colors">トップ</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">企業情報</Link></li>
                <li><Link href="/services" className="hover:text-white transition-colors">事業内容</Link></li>
                <li><Link href="/news" className="hover:text-white transition-colors">お知らせ</Link></li>
                <li><Link href="/recruit" className="hover:text-white transition-colors">採用情報</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">お問い合わせ</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white text-sm font-semibold mb-3">所在地</p>
              <ul className="space-y-2 text-sm leading-relaxed">
                <li>〒101-0032</li>
                <li>東京都千代田区岩本町</li>
                <li>2-13-6 リアライズ岩本町ビル 5F</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 text-xs text-slate-500">
          © {new Date().getFullYear()} 株式会社マウンテン. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
