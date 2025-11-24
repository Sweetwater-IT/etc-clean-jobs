"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2, X, CheckCircle } from "lucide-react"
import { JobEditDialog } from "@/components/job-edit-dialog"
import { BulkEditDialog } from "@/components/bulk-edit-dialog"
import { DataTable } from "@/components/data-table"
import { columns } from "@/components/columns"
import type { Job, ValidationIssue } from "@/types/job"
import { supabase } from "@/lib/supabase/client"

export function JobCleaningDashboard() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [totalJobs, setTotalJobs] = useState<number>(0)
  const [validatedJobsCount, setValidatedJobsCount] = useState<number>(0)
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([])
  const [selectedIssue, setSelectedIssue] = useState<ValidationIssue | null>(null)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false)
  const [bulkEditColumn, setBulkEditColumn] = useState<string>("")
  const [bulkEditJobs, setBulkEditJobs] = useState<Job[]>([])

// Total jobs from dirty table
useEffect(() => {
    supabase
        .from("etc_dirty_jobs")
        .select("*", { count: "exact", head: true })
        .then(({ count }) => {
        if (count !== null) setTotalJobs(count)
        })
}, [])

// Validated jobs from clean table
useEffect(() => {
    supabase
      .from("etc_clean_jobs")
      .select("id", { count: "exact", head: true })
      .eq("fully_validated", true)
      .then(({ count }) => {
        if (count !== null) setValidatedJobsCount(count)
      })
}, [])

useEffect(() => {
    fetchJobs()
}, [])

// This runs EVERY time jobs change — guarantees issues are calculated
useEffect(() => {
  if (jobs.length > 0) {
    calculateValidationIssues(jobs)
  }
}, [jobs])

  async function fetchJobs() {
    setLoading(true)
    try {
      // Get ALL dirty jobs first — this guarantees we have 450 rows
      const { data: dirtyData, error: dirtyError } = await supabase
        .from("etc_dirty_jobs")
        .select("*")
        .order("id", { ascending: true })
  
      if (dirtyError) throw dirtyError
      if (!dirtyData || dirtyData.length === 0) {
        setJobs([])
        setLoading(false)
        return
      }
  
      // Get clean rows (may be missing for some)
      const { data: cleanData } = await supabase
        .from("etc_clean_jobs")
        .select("*")
        .in("dirty_job_id", dirtyData.map(d => d.id))
  
      // Map clean rows for fast lookup
      const cleanMap = Object.fromEntries(
        (cleanData || []).map(c => [c.dirty_job_id, c])
      )
  
      const jobs = dirtyData.map(d => {
        const c = cleanMap[d.id] || {}
  
        const toDate = (s: string | null) => {
          if (!s?.trim()) return null
          const [m, day, y] = s.split("/")
          return `${y}-${m.padStart(2, "0")}-${day.padStart(2, "0")}`
        }
  
        const isJobNumberValid = 
          c.branch_prefix_valid && 
          c.type_prefix_valid && 
          c.job_suffix_valid
  
        return {
          id: d.id.toString(),
          combined_job_number: isJobNumberValid ? c.combined_job_number : d.combined_job_number || "",
          branch_prefix: c.branch_prefix_valid ? c.branch_prefix?.toString() : d.branch_prefix || "",
          type_prefix: c.type_prefix_valid ? c.type_prefix?.toString() : d.type_prefix || "",
          job_suffix: c.job_suffix_valid ? c.job_suffix : d.job_suffix || "",
          job_number: d.job_number || "",
          bid_number: c.bid_number_valid ? c.bid_number?.toString() : d.bid_number || "",
          job_location: c.job_location || d.job_location || "",
          contractor: c.contractor || d.contractor || "",
          rate: c.rate_valid ? c.rate?.toFixed(2) : d.rate || "",
          fringe: c.fringe_valid ? c.fringe?.toFixed(2) : d.fringe || "",
          is_rated: c.is_rated_valid ? (c.is_rated ? "y" : "n") : d.is_rated || "n",
          start_date: c.start_date_valid ? c.start_date : toDate(d.start_date),
          end_date: c.end_date_valid ? c.end_date : toDate(d.end_date),
          type: c.type_valid ? c.type : d.type?.toLowerCase() || "",
          office: c.office_valid ? c.office : d.office?.toLowerCase() || "",
          pm: c.pm_valid ? c.pm : d.pm?.trim() || "",
          job_status: c.job_status_valid ? c.job_status : d.job_status?.trim() || "",
  
          // Validation flags
          branch_prefix_valid: !!c.branch_prefix_valid,
          type_prefix_valid: !!c.type_prefix_valid,
          job_suffix_valid: !!c.job_suffix_valid,
          bid_number_valid: !!c.bid_number_valid,
          rate_valid: !!c.rate_valid,
          fringe_valid: !!c.fringe_valid,
          is_rated_valid: !!c.is_rated_valid,
          start_date_valid: !!c.start_date_valid,
          end_date_valid: !!c.end_date_valid,
          type_valid: !!c.type_valid,
          office_valid: !!c.office_valid,
          pm_valid: !!c.pm_valid,
          job_status_valid: !!c.job_status_valid,
          fully_validated: !!c.fully_validated,
        }
      })
  
      setJobs(jobs)
      calculateValidationIssues(jobs)
    } catch (error) {
      console.error("Failed to fetch jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  function calculateValidationIssues(jobsData: Job[]) {
    const issues: ValidationIssue[] = []

    const addIssue = (field: keyof Job, label: string) => {
      const invalid = jobsData.filter(j => !(j as any)[field + "_valid"])
      if (invalid.length > 0) {
        issues.push({
          field,
          label,
          count: invalid.length,
          type: "missing",
          affectedJobs: invalid,
        })
      }
    }

    addIssue("start_date", "Start Date")
    addIssue("end_date", "End Date")
    addIssue("job_status", "Job Status")
    addIssue("office", "Office")
    addIssue("type", "Type")
    addIssue("pm", "Project Manager")
    addIssue("rate", "Rate")
    addIssue("fringe", "Fringe")
    addIssue("is_rated", "Is Rated")

    setValidationIssues(issues)
  }

  async function handleJobUpdate(updatedJob: Job) {
    try {
      const response = await fetch(`/api/jobs/${updatedJob.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedJob),
      })

      if (response.ok) {
        await fetchJobs()
        setSelectedJob(null)
        setSelectedIssue(null)
      }
    } catch (error) {
      console.error("Failed to update job:", error)
    }
  }

  const handleBulkEdit = (selectedJobs: Job[], column: string) => {
    setBulkEditJobs(selectedJobs)
    setBulkEditColumn(column)
    setIsBulkEditOpen(true)
  }

  const handleBulkSave = async (column: string, value: string) => {
    const updatedJobs = jobs.map((job) => {
      if (bulkEditJobs.some((bulkJob) => bulkJob.id === job.id)) {
        return { ...job, [column]: value }
      }
      return job
    })
    setJobs(updatedJobs)
    calculateValidationIssues(updatedJobs)
    setIsBulkEditOpen(false)
  }


if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-2xl font-semibold">ETC Job List Cleaner</h1>
          <div className="flex items-center gap-2 mt-1">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{validatedJobsCount}</span> of{" "}
              <span className="font-medium text-foreground">{totalJobs || jobs.length}</span> jobs validated
            </p>
          </div>
        </div>
      </div>

      {validationIssues.length > 0 && (
        <div className="space-y-2">
          {selectedIssue && (
            <div className="flex items-center gap-2 pb-2 border-b">
              <span className="text-sm font-medium">
                Showing {selectedIssue.affectedJobs.length} jobs with {selectedIssue.label} issues
              </span>
              <Button variant="ghost" size="sm" onClick={() => setSelectedIssue(null)}>
                <X className="h-3 w-3 mr-1" />
                Clear filter
              </Button>
            </div>
          )}
          {validationIssues.map((issue) => (
            <Button
              key={issue.field}
              variant="ghost"
              className="h-auto py-2 px-0 justify-start font-normal hover:bg-transparent group"
              onClick={() => setSelectedIssue(selectedIssue?.field === issue.field ? null : issue)}
            >
              <AlertCircle className="h-4 w-4 mr-2 text-orange-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                <span className="font-medium text-foreground">{issue.count}</span> jobs need{" "}
                <span className="font-medium text-foreground underline decoration-orange-500/50 underline-offset-2 group-hover:decoration-orange-500 group-hover:text-orange-500 transition-colors">
                  {issue.label}
                </span>{" "}
                corrected
              </span>
            </Button>
          ))}
        </div>
      )}

      <DataTable
        columns={columns}
        data={selectedIssue ? selectedIssue.affectedJobs : jobs}
        onRowClick={setSelectedJob}
        onBulkEdit={handleBulkEdit}
      />

      {selectedJob && (
        <JobEditDialog
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onSave={handleJobUpdate}
          highlightField={selectedIssue?.field}
        />
      )}

      <BulkEditDialog
        open={isBulkEditOpen}
        onOpenChange={setIsBulkEditOpen}
        jobs={bulkEditJobs}
        column={bulkEditColumn}
        onSave={handleBulkSave}
      />
    </div>
  )
}
