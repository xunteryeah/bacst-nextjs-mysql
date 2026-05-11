import {NextResponse} from "next/server";
import { pool } from '@/lib/db'


export async function GET(request) {
    try {
        const [rows] = await pool.query('SELECT * FROM addressData ORDER BY created_at DESC LIMIT 1');
        // mysql2 通常会把 JSON 列自动解析成数组；做一次防御性处理以应对老库或字符串回退情况
        const normalized = rows.map((row) => {
            let addresses = row.address
            if (typeof addresses === 'string') {
                try {
                    addresses = JSON.parse(addresses)
                } catch {
                    addresses = addresses ? [addresses] : []
                }
            }
            if (!Array.isArray(addresses)) {
                addresses = addresses ? [addresses] : []
            }
            return { ...row, address: addresses }
        })
        return NextResponse.json({ data: normalized }, { status: 200 })
    } catch (error) {
        console.error('Error fetching addressData:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
