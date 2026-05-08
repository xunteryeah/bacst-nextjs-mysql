import { NextResponse } from 'next/server'
const mysql = require('mysql2/promise')

// 创建全局的 MySQL 连接池
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.MYSQL_HOST || '127.0.0.1',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '362880',
  database: process.env.MYSQL_DATABASE || 'bacst',
})

export async function GET(request) {
  try {
    // 执行 MySQL 查询
    const [rows, fields] = await pool.query('SELECT * FROM data')
    return NextResponse.json({ data: rows }, { status: 200 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
