import { NextResponse } from "next/server";
import { pool } from '@/lib/db'

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM certifications ORDER BY created_at DESC');
    return NextResponse.json({ data: rows }, { status: 200 });
  } catch (error) {
    console.error('Error fetching certifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}