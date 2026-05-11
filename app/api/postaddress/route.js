import {NextResponse} from "next/server";
import { pool } from '@/lib/db'
import { verifyApiKey } from "@/lib/verifyApiKey";

export async function POST(request) {
    const authError = verifyApiKey(request);
    if (authError) return authError;

    try {
        // 获取请求体数据
        const data = await request.json()
        // address 为字符串数组，写入前序列化为 JSON 字符串
        const payload = {
            ...data,
            address: Array.isArray(data.address)
                ? JSON.stringify(data.address.filter((a) => typeof a === 'string' && a.trim() !== ''))
                : JSON.stringify(data.address ? [data.address] : []),
        }
        // 执行插入操作
        const [result] = await pool.query(
            'INSERT INTO addressData SET ?',
            payload
        )
        // 返回插入成功的响应
        return NextResponse.json({ 
            message: 'Data inserted successfully',
            insertId: result.insertId 
        }, { status: 201 })
    } catch (error) {
        console.error('Error inserting addressData:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
