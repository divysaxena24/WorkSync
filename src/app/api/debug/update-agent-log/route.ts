import { NextResponse } from "next/server";
import { sql } from "@/lib/core/neon";

export async function GET() {
  try {
    // Add 'model' column to 'AgentDecisionLog'
    await sql`
      ALTER TABLE "AgentDecisionLog" 
      ADD COLUMN IF NOT EXISTS "model" TEXT
    `;

    return NextResponse.json({ 
      success: true, 
      message: "AgentDecisionLog table updated successfully with 'model' column" 
    });
  } catch (error: any) {
    console.error("[UPDATE_AGENT_LOG]", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
