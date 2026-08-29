import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'DATABASE_URL is not configured' });

  const userId = typeof req.query.userId === 'string' ? req.query.userId : 'default';
  const date = typeof req.query.date === 'string' ? req.query.date : new Date().toISOString().slice(0, 10);
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`
    SELECT user_id, date, steps, active_calories, sleep_minutes, weight_kg, heart_rate_avg, workouts, updated_at
    FROM health_daily
    WHERE user_id = ${userId} AND date = ${date}
    LIMIT 1
  `;
  return res.status(200).json({ data: rows[0] ?? null });
}
