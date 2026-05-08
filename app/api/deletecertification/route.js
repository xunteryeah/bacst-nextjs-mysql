import { NextResponse } from "next/server";
import { pool } from '@/lib/db'
import { verifyApiKey } from "@/lib/verifyApiKey";

export async function DELETE(request) {
    const authError = verifyApiKey(request);
    if (authError) return authError;

    try {
        const { searchParams } = new URL(request.url);
        const title = searchParams.get('title');
        if (!title) {
            return NextResponse.json(
                { error: "缺少必要参数: title" },
                { status: 400 }
            );
        }
        const [result] = await pool.query(
            'DELETE FROM certifications WHERE title = ?',
            [title]
        );
        if (result.affectedRows === 0) {
            return NextResponse.json(
                { error: "未找到匹配的记录" },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { message: "删除成功", affectedRows: result.affectedRows },
            { status: 200 }
        );
    } catch (error) {
        console.error('删除证书失败:', error);
        return NextResponse.json(
            { error: '服务器内部错误' },
            { status: 500 }
        );
    }
}