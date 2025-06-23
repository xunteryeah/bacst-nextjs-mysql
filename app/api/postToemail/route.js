import { NextResponse } from "next/server";
import { pool } from '@/lib/db'


export async function POST(request) {
    try {
        // 从连接池获取连接
        const connection = await pool.getConnection()
        // 获取请求体数据
        const data = await request.json()
        const { name, tophone, message, purpose } = data;

        if (!name || !tophone || !message || !purpose) {
            return res.status(400).json({ error: "缺少必要字段" });
        }
        await sendEmail({ name, tophone, message, purpose });
        
        // 释放连接
        connection.release()
        // 返回插入成功的响应
        return NextResponse.json({
            message: 'Data inserted successfully',
            
        }, { status: 201 })
    } catch (error) {
        console.error('Error inserting productdata:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

