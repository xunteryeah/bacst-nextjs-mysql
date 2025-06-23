import { NextResponse } from "next/server";

export function verifyApiKey(request) {
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey || apiKey !== process.env.ADMIN_SECRET_KEY) {
        return NextResponse.json({ error: "无效密钥" }, { status: 403 });
    }
    return null; // 表示验证通过
}
