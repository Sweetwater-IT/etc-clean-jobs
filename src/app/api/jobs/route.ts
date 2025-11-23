import { NextResponse } from "next/server"
import { dummyJobs } from "@/lib/dummy-data"

export async function GET() {
  // TODO: Replace with your actual database query
  // Example: const jobs = await db.query('SELECT * FROM jobs')

  // For now, returning dummy jobs data for testing
  return NextResponse.json(dummyJobs)
}
