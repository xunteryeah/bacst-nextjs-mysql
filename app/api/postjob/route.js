import { NextResponse } from "next/server";
import { pool } from '@/lib/db'
import { verifyApiKey } from "@/lib/verifyApiKey";

export async function POST(request) {
  const authError = verifyApiKey(request);
  if (authError) return authError;

  try {
    const data = await request.json();
    const [result] = await pool.query(
      'INSERT INTO jobs SET ?',
      data
    );
    return NextResponse.json({ message: 'Data inserted successfully', insertId: result.insertId }, { status: 201 });
  } catch (error) {
    console.error('Error inserting job:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}