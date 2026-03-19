import { NextResponse } from 'next/server'
import { getDb, SCHEMA } from '@/lib/db'
import bcrypt from 'bcryptjs'
export async function GET() { return POST() }
export async function POST() {
  try {
    const sql = getDb()
    for (const s of SCHEMA) { try { await sql(s) } catch(e){ const m=String(e); if(!m.includes('already exists')&&!m.includes('duplicate')) console.error('Schema err:',m) } }
    const ex = await sql`SELECT id FROM usuarios WHERE usuario='Franco.Toso' LIMIT 1`
    if (!ex.length) {
      const h = await bcrypt.hash('12345678',12)
      await sql`INSERT INTO usuarios(nombre,usuario,password_hash,rol) VALUES('Franco Toso','Franco.Toso',${h},'admin')`
    }
    return NextResponse.json({ok:true,message:'DB inicializada',user:'Franco.Toso',pass:'12345678'})
  } catch(e){ return NextResponse.json({error:String(e)},{status:500}) }
}
