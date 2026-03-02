import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, nameKana, email, message } = body as {
      name: string;
      nameKana: string;
      email: string;
      message: string;
    };

    // 필수값 서버 사이드 체크
    if (!name || !nameKana || !email || !message) {
      return NextResponse.json({ error: "必須項目が不足しています。" }, { status: 400 });
    }

    const to = process.env.RESEND_TO;
    if (!to) {
      console.error("RESEND_TO is not set");
      return NextResponse.json({ error: "サーバー設定エラーです。" }, { status: 500 });
    }

    const { error } = await resend.emails.send({
      from: "onboarding@resend.dev",   // Resend 검증 전 기본 송신자
      to,
      replyTo: email,
      subject: `【お問い合わせ】${name} 様`,
      text: [
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "株式会社マウンテン お問い合わせフォーム",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        `氏名       : ${name}`,
        `フリガナ   : ${nameKana}`,
        `メール     : ${email}`,
        "",
        "【お問い合わせ内容】",
        message,
        "",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "このメールはウェブサイトのお問い合わせフォームから自動送信されました。",
      ].join("\n"),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "メール送信に失敗しました。" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "サーバーエラーが発生しました。" }, { status: 500 });
  }
}
