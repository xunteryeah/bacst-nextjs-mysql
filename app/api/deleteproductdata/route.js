import { NextResponse } from "next/server";
import { pool } from '@/lib/db'
import { verifyApiKey } from "@/lib/verifyApiKey";

export async function DELETE(request) {
    const authError = verifyApiKey(request);
    if (authError) return authError;

    try {
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');
        
        // 参数校验
        if (!name) {
            return NextResponse.json(
                { error: "缺少必要参数: name" },
                { status: 400 }
            );
        }
        // 执行删除操作
        const [result] = await pool.query(
            'DELETE FROM products WHERE name = ?',
            [name]
        );
        // 检查是否成功删除
        if (result.affectedRows === 0) {
            return NextResponse.json(
                { error: "未找到匹配的产品" },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { message: "删除成功", affectedRows: result.affectedRows },
            { status: 200 }
        );
    } catch (error) {
        console.error('删除产品失败:', error);
        return NextResponse.json(
            { error: '服务器内部错误' },
            { status: 500 }
        );
    }
}