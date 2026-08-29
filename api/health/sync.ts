import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

function allowCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function getToken(req: VercelRequest) {
  const auth = req.headers.authorization || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : '';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  allowCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });


  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: 'DATABASE_URL is not configured' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  if (!body?.date) return res.status(400).json({ error: 'date is required' });

  const sql = neon(process.env.DATABASE_URL);
  await sql`
    INSERT INTO health_daily
      (user_id, date, steps, active_calories, sleep_minutes, weight_kg, heart_rate_avg, workouts, raw_payload)
    VALUES
      (${body.userId || 'default'}, ${body.date}, ${body.steps ?? null}, ${body.activeCalories ?? null},
       ${body.sleepMinutes ?? null}, ${body.weightKg ?? null}, ${body.heartRateAvg ?? null},
       ${JSON.stringify(body.workouts ?? [])}::jsonb, ${JSON.stringify(body)}::jsonb)
    ON CONFLICT (user_id, date)
    DO UPDATE SET
      steps = EXCLUDED.steps,
      active_calories = EXCLUDED.active_calories,
      sleep_minutes = EXCLUDED.sleep_minutes,
      weight_kg = EXCLUDED.weight_kg,
      heart_rate_avg = EXCLUDED.heart_rate_avg,
      workouts = EXCLUDED.workouts,
      raw_payload = EXCLUDED.raw_payload,
      updated_at = NOW()
  `;

  return res.status(200).json({ ok: true, date: body.date });
}
