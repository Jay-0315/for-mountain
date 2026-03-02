import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, nameKana, email, message } = body as {
      name: string;
      nameKana: string;
      email: string;
      message: string;
    };

    if (!name || !nameKana || !email || !message) {
      return NextResponse.json({ error: "必須項目が不足しています。" }, { status: 400 });
    }

    const res = await fetch(`${BACKEND_URL}/api/v1/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, nameKana, email, message }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: (json as { message?: string }).message ?? "メール送信に失敗しました。" },
        { status: res.status }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact proxy error:", err);
    return NextResponse.json({ error: "サーバーエラーが発生しました。" }, { status: 500 });
  }
}
