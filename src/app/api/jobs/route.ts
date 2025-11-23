// src/app/api/jobs/route.ts
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/server"

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("etc_clean_jobs")
      .select(`
        *,
        dirty:etc_dirty_jobs (*)
      `)
      .order("dirty_job_id", { ascending: true })

    if (error) throw error

    const jobs = data.map((row: any) => {
      const c = row
      const d = row.dirty

      const toDate = (dirtyDate: string | null) => {
        if (!dirtyDate || dirtyDate.trim() === "") return null
        const [m, day, y] = dirtyDate.split("/")
        return `${y}-${m.padStart(2, "0")}-${day.padStart(2, "0")}`
      }

      return {
        id: c.dirty_job_id.toString(),
        branch_prefix: c.branch_prefix_valid ? c.branch_prefix?.toString() : d.branch_prefix,
        type_prefix: c.type_prefix_valid ? c.type_prefix?.toString() : d.type_prefix,
        job_suffix: c.job_suffix_valid ? c.job_suffix : d.job_suffix,
        combined_job_number: c.combined_job_number || d.combined_job_number,
        job_number: d.job_number || "",
        bid_number: c.bid_number_valid ? c.bid_number?.toString() : d.bid_number,
        job_location: c.job_location || d.job_location,
        contractor: c.contractor || d.contractor,
        rate: c.rate_valid ? c.rate?.toFixed(2) : d.rate,
        fringe: c.fringe_valid ? c.fringe?.toFixed(2) : d.fringe,
        is_rated: c.is_rated_valid ? (c.is_rated ? "y" : "n") : d.is_rated,
        start_date: c.start_date_valid ? c.start_date : toDate(d.start_date),
        end_date: c.end_date_valid ? c.end_date : toDate(d.end_date),
        type: c.type_valid ? c.type : d.type?.toLowerCase(),
        office: c.office_valid ? c.office : d.office?.toLowerCase(),
        pm: c.pm_valid ? c.pm : d.pm?.trim(),
        job_status: c.job_status_valid ? c.job_status : d.job_status?.trim(),
        branch_prefix_valid: c.branch_prefix_valid,
        type_prefix_valid: c.type_prefix_valid,
        job_suffix_valid: c.job_suffix_valid,
        bid_number_valid: c.bid_number_valid,
        rate_valid: c.rate_valid,
        fringe_valid: c.fringe_valid,
        is_rated_valid: c.is_rated_valid,
        start_date_valid: c.start_date_valid,
        end_date_valid: c.end_date_valid,
        type_valid: c.type_valid,
        office_valid: c.office_valid,
        pm_valid: c.pm_valid,
        job_status_valid: c.job_status_valid,
        fully_validated: c.fully_validated,
      }
    })

    return NextResponse.json(jobs)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
  }
}