import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const { data: projects } = await supabaseAdmin
    .from('projects')
    .select('*, blueprints(*)')
    .order('created_at', { ascending: false })

  return NextResponse.json({ projects: projects ?? [] })
}