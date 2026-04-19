import mysql from 'mysql2/promise'

export const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.MYSQL_HOST || '127.0.0.1',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '362880',
    database: process.env.MYSQL_DATABASE || 'bacst',
    charset: 'utf8mb4',
})