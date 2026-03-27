import { sql } from "@/lib/neon";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const indexes = await sql`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'User'
    `;
    return NextResponse.json(indexes);
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
