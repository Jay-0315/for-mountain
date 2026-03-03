"use client";

import Image from "next/image";

export default function PartnersSection() {
    return (
        <section id="partners" className="py-24 bg-gray-50 overflow-hidden">
            <div className="max-w-6xl mx-auto px-6">

                {/* 헤더 섹션 */}
                <div className="text-center mb-16">
                    <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-3">
                        MOUNTAIN PARTNERS
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                        株式会社マウンテン 協力会社
                    </h2>
                    <div className="h-1 w-20 bg-orange-500 mx-auto mb-6" /> {/* 포인트 라인 */}
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                        共に成長し、革新を創り出す株式会社マウンテンの大切なパートナー企業様です。
                    </p>
                </div>

                {/* 📸 요청하신 이미지 배치 부분 */}
                <div className="relative w-full max-w-5xl mx-auto h-[250px] sm:h-[400px] md:h-[500px] group">
                    {/* 이미지 외곽 테두리 효과 (선택사항) */}
                    <div className="absolute -inset-4 bg-slate-50 rounded-[2rem] -z-10 scale-95 group-hover:scale-100 transition-transform duration-700" />

                    <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-xl border border-slate-100">
                        <Image
                            src="/partner.png" // 요청하신 경로 적용
                            alt="Mountain Partners Group Photo"
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-105"
                            priority
                        />
                        {/* 하단에 살짝 어두운 그라데이션 (가독성용) */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60" />
                    </div>
                </div>

            </div>
        </section>
    );
}