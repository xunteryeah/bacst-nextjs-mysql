import {NextResponse} from "next/server";
import { pool } from '@/lib/db'


export async function GET(request) {
    try {
        // 从 URL 获取 id 参数
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 })
        }
        // 从连接池获取连接
        const connection = await pool.getConnection()
        // 执行查询，根据 id 获取产品数据
        const [rows] = await connection.query('SELECT * FROM products WHERE id = ?', [id])
        // 释放连接
        connection.release()
        if (rows.length === 0) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }
        const row = rows[0]
        const parseJsonField = (v, fallback) => {
            if (v == null || v === '') return fallback
            if (typeof v !== 'string') return v
            try { return JSON.parse(v) } catch { return fallback }
        }
        row.images = parseJsonField(row.images, [])
        row.specs = parseJsonField(row.specs, [])
        // 返回 JSON 格式数据，结构为 { data: {...} }
        return NextResponse.json({ data: row }, { status: 200 })
    } catch (error) { 
        console.error('Error fetching product:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}