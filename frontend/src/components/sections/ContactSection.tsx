"use client";

import { useState, useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type FormData = {
  name: string;
  nameKana: string;
  email: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

// ── Floating Label 입력 컴포넌트 ──────────────────────────────
function FloatingInput({
  label,
  name,
  type = "text",
  value,
  error,
  placeholder,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  error?: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="relative">
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        placeholder=" "
        autoComplete="off"
        className={`peer w-full px-4 pt-6 pb-2 rounded-xl border text-sm text-slate-900 outline-none transition-all
          ${error
            ? "border-red-400 bg-red-50 focus:border-red-500"
            : "border-slate-200 bg-white focus:border-orange-500 focus:shadow-sm focus:shadow-orange-100"
          }`}
      />
      <label
        htmlFor={name}
        className={`absolute left-4 transition-all duration-200 pointer-events-none select-none
          top-4 text-sm text-slate-400
          peer-focus:top-2 peer-focus:text-xs peer-focus:text-orange-500
          peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs
          ${error ? "peer-[:not(:placeholder-shown)]:text-red-400" : "peer-[:not(:placeholder-shown)]:text-slate-400"}
        `}
      >
        {label} <span className="text-red-400">*</span>
      </label>
      {placeholder && !value && (
        <span className="absolute left-4 bottom-2 text-xs text-slate-300 pointer-events-none select-none peer-focus:opacity-0 peer-[:not(:placeholder-shown)]:opacity-0 transition-opacity">
          {placeholder}
        </span>
      )}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Floating Textarea ─────────────────────────────────────────
function FloatingTextarea({
  label,
  name,
  value,
  error,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <div className="relative">
      <textarea
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        rows={5}
        placeholder=" "
        className={`peer w-full px-4 pt-6 pb-2 rounded-xl border text-sm text-slate-900 outline-none resize-none transition-all
          ${error
            ? "border-red-400 bg-red-50 focus:border-red-500"
            : "border-slate-200 bg-white focus:border-orange-500 focus:shadow-sm focus:shadow-orange-100"
          }`}
      />
      <label
        htmlFor={name}
        className={`absolute left-4 transition-all duration-200 pointer-events-none select-none
          top-4 text-sm text-slate-400
          peer-focus:top-2 peer-focus:text-xs peer-focus:text-orange-500
          peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs
          ${error ? "peer-[:not(:placeholder-shown)]:text-red-400" : "peer-[:not(:placeholder-shown)]:text-slate-400"}
        `}
      >
        {label} <span className="text-red-400">*</span>
      </label>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    nameKana: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // ── ScrollTrigger 진입 애니메이션
  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      gsap.from(".contact-left > *", {
        opacity: 0,
        x: -40,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".contact-left",
          start: "top 80%",
          once: true,
        },
      });

      gsap.from(".contact-form > *", {
        opacity: 0,
        y: 25,
        duration: 0.65,
        stagger: 0.09,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".contact-form",
          start: "top 82%",
          once: true,
        },
      });
    },
    { scope: sectionRef }
  );

  // ── Magnetic 버튼 (送信)
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    const handleMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: "power2.out" });
    };
    const handleLeave = () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" });
    };

    btn.addEventListener("mousemove", handleMove);
    btn.addEventListener("mouseleave", handleLeave);
    return () => {
      btn.removeEventListener("mousemove", handleMove);
      btn.removeEventListener("mouseleave", handleLeave);
    };
  }, [submitted]);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!formData.name.trim()) e.name = "これは必須項目です。";
    if (!formData.nameKana.trim()) {
      e.nameKana = "これは必須項目です。";
    } else if (!/^[\u30A0-\u30FF\s]+$/.test(formData.nameKana)) {
      e.nameKana = "カタカナで入力してください。";
    }
    if (!formData.email.trim()) {
      e.email = "これは必須項目です。";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      e.email = "有効なメールアドレスを入力してください！";
    }
    if (!formData.message.trim()) e.message = "これは必須項目です。";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setApiError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok) {
        setApiError(json.error ?? "送信に失敗しました。しばらくしてから再度お試しください。");
      } else {
        setSubmitted(true);
      }
    } catch {
      setApiError("ネットワークエラーが発生しました。しばらくしてから再度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <section ref={sectionRef} id="contact" className="py-24 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* 왼쪽 설명 */}
          <div className="contact-left">
            <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-3">
              Contact
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              お問い合わせ
            </h2>
            <p className="text-slate-600 leading-relaxed mb-8">
              採用や当社に関するご質問など、お気軽にお問い合わせください。
              担当者より折り返しご連絡いたします。
            </p>

            <div className="p-5 bg-slate-50 rounded-2xl flex items-start gap-4">
              <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-0.5">所在地</p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  〒101-0032<br />
                  東京都千代田区岩本町2-13-6<br />
                  リアライズ岩本町ビル 5F
                </p>
              </div>
            </div>
          </div>

          {/* 오른쪽 폼 */}
          <div>
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">送信完了しました</h3>
                <p className="text-slate-500 text-sm">
                  お問い合わせありがとうございます。<br />
                  担当者より折り返しご連絡いたします。
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="contact-form space-y-5"
              >
                {/* API 에러 배너 */}
                {apiError && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                    <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {apiError}
                  </div>
                )}
                <FloatingInput
                  label="氏名"
                  name="name"
                  value={formData.name}
                  error={errors.name}
                  placeholder="山田 太郎"
                  onChange={handleChange}
                />
                <FloatingInput
                  label="氏名（フリガナ）"
                  name="nameKana"
                  value={formData.nameKana}
                  error={errors.nameKana}
                  placeholder="ヤマダ タロウ"
                  onChange={handleChange}
                />
                <FloatingInput
                  label="Emailアドレス"
                  name="email"
                  type="email"
                  value={formData.email}
                  error={errors.email}
                  placeholder="example@mail.com"
                  onChange={handleChange}
                />
                <FloatingTextarea
                  label="お問い合わせ内容"
                  name="message"
                  value={formData.message}
                  error={errors.message}
                  onChange={handleChange}
                />

                {/* Magnetic 送信ボタン */}
                <div className="flex justify-center pt-2">
                  <button
                    ref={btnRef}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-orange-500 text-white font-semibold rounded-xl
                               hover:bg-orange-400 transition-colors
                               hover:shadow-xl hover:shadow-orange-300/40
                               active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed
                               flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        送信中...
                      </>
                    ) : "送信する"}
                  </button>
                </div>

                <p className="text-xs text-slate-400 text-center">
                  <span className="text-red-400">*</span> は必須項目です。
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
