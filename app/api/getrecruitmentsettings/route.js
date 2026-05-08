import { NextResponse } from "next/server";
import { pool } from '@/lib/db'

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM recruitment_settings ORDER BY created_at DESC LIMIT 1');
    return NextResponse.json({ data: rows?.[0] || null }, { status: 200 });
  } catch (error) {
    console.error('Error fetching recruitment settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}