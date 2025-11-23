// src/types/job.ts
export interface Job {
  id: string

  // Core identifiers
  branch_prefix: string
  type_prefix: string
  job_suffix: string
  combined_job_number: string
  job_number?: string
  bid_number?: string

  // Job details
  job_location: string
  contractor: string

  // Financial
  rate?: string
  fringe?: string
  is_rated?: string

  // Dates
  start_date?: string | null
  end_date?: string | null

  // Classification
  type: string
  office: string
  pm: string
  job_status: string

  // Validation flags (from clean table)
  branch_prefix_valid?: boolean
  type_prefix_valid?: boolean
  job_suffix_valid?: boolean
  bid_number_valid?: boolean
  rate_valid?: boolean
  fringe_valid?: boolean
  is_rated_valid?: boolean
  start_date_valid?: boolean
  end_date_valid?: boolean
  type_valid?: boolean
  office_valid?: boolean
  pm_valid?: boolean
  job_status_valid?: boolean
  fully_validated?: boolean
}

export interface ValidationIssue {
  field: string
  label: string
  count: number
  type: "missing" | "invalid"
  affectedJobs: Job[]
}