import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8080"
    : process.env.BACKEND_URL ||
      "https://for-mountain-service-505197475308.asia-northeast3.run.app";

async function proxy(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const targetPath = path.join("/");
    const searchParams = req.nextUrl.search;
    const targetUrl = `${BACKEND_URL}/${targetPath}${searchParams}`;

    const init: RequestInit = {
      method: req.method,
      headers: {
        "Content-Type": req.headers.get("Content-Type") || "application/json",
        ...(req.headers.get("Authorization") && {
          Authorization: req.headers.get("Authorization")!,
        }),
      },
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      const body = await req.text();
      if (body) init.body = body;
    }

    const response = await fetch(targetUrl, init);
    if (response.status === 204 || response.status === 205 || response.status === 304) {
      return new NextResponse(null, {
        status: response.status,
      });
    }

    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error) {
    console.error("Proxy Error:", error);
    return NextResponse.json(
      {
        message:
          "Backend proxy failed. Check backend server at http://localhost:8080",
      },
      { status: 500 }
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
