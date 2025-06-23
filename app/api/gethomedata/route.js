import { NextResponse } from "next/server";
import { pool } from '@/lib/db'

export async function GET(request) {
    
    try {
        // 从连接池获取连接
        const connection = await pool.getConnection()

        // 执行查询，获取所有 homeData 表数据
        const [rows] = await connection.query('SELECT * FROM homeData ORDER BY created_at DESC LIMIT 1')

        // 释放连接
        connection.release()

        // 返回 JSON 格式数据，结构为 { data: [...] }
        return NextResponse.json({ data: rows }, { status: 200 })
    } catch (error) {
        console.error('Error fetching homeData:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
