import mysql from 'mysql2'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

export const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'bloop'
})