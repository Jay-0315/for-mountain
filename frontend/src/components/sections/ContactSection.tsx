"use client";

import Image from "next/image";
import { useState, useRef } from "react";
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

      gsap.to(".contact-left", {
        y: -18,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(".contact-form", {
        y: -26,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: sectionRef }
  );

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
      const res = await fetch("/api/v1/contact", {
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
    <section
      ref={sectionRef}
      id="contact"
      className="relative isolate min-h-screen overflow-hidden bg-slate-100 px-6 py-28 sm:px-10 lg:px-6"
    >
      <Image
        src="/images/contact-office-inquiry.png"
        alt="お問い合わせ対応イメージ"
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 -z-20 object-cover object-center"
      />
      <div className="absolute inset-0 -z-10 bg-white/10" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(248,250,252,0.82)_0%,rgba(248,250,252,0.56)_42%,rgba(248,250,252,0.02)_100%)]" />

      <div className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-6xl items-center">
        <div className="w-full max-w-xl rounded-2xl bg-white/94 p-7 shadow-2xl shadow-slate-900/10 ring-1 ring-white/80 backdrop-blur md:p-10">
          <div className="contact-left">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-orange-500">
              Contact
            </p>
            <h2 className="text-3xl font-bold leading-tight text-slate-950 md:text-5xl">
              お問い合わせ
            </h2>
            <p className="mt-5 text-sm leading-7 text-slate-600 md:text-base">
              採用や当社に関するご質問など、お気軽にお問い合わせください。
              担当者より折り返しご連絡いたします。
            </p>
          </div>

          <div className="contact-form mt-8">
            {submitted ? (
              <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 px-6 py-14 text-center ring-1 ring-slate-100">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-500">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">送信完了しました</h3>
                <p className="text-sm text-slate-500">
                  お問い合わせありがとうございます。<br />
                  担当者より折り返しご連絡いたします。
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {apiError && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 font-semibold text-white
                             transition-all hover:-translate-y-0.5 hover:bg-orange-400
                             hover:shadow-xl hover:shadow-orange-300/40
                             disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {isLoading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      送信中...
                    </>
                  ) : "送信する"}
                </button>

                <p className="text-center text-xs text-slate-400">
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
