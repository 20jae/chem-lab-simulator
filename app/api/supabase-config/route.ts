import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) return NextResponse.json({ error: 'Supabase environment variables are not configured.' }, { status: 503 });

  // The anonymous key is designed for browser use. Row-level security protects user data.
  return NextResponse.json({ url, anonKey }, { headers: { 'Cache-Control': 'no-store' } });
}

