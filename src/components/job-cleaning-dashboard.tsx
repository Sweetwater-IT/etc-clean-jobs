"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2, X, CheckCircle } from "lucide-react"
import { JobEditDialog } from "@/components/job-edit-dialog"
import { BulkEditDialog } from "@/components/bulk-edit-dialog"
import { DataTable } from "@/components/data-table"
import { columns } from "@/components/columns"
import type { Job, ValidationIssue } from "@/types/job"

export function JobCleaningDashboard() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([])
  const [selectedIssue, setSelectedIssue] = useState<ValidationIssue | null>(null)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false)
  const [bulkEditColumn, setBulkEditColumn] = useState<string>("")
  const [bulkEditJobs, setBulkEditJobs] = useState<Job[]>([])

  useEffect(() => {
    fetchJobs()
  }, [])

// Inside JobCleaningDashboard.tsx — replace the old fetchJobs()
async function fetchJobs() {
  setLoading(true)
  try {
    const { data, error } = await supabase
      .from("etc_dirty_jobs")
      .select("*")
      .order("id", { ascending: true })

    if (error) throw error

    // Map Supabase snake_case → your frontend camelCase
    const jobs = data.map((job: any) => ({
      id: job.id.toString(),
      branch_prefix: job.branch_prefix,
      type_prefix: job.type_prefix,
      job_suffix: job.job_suffix,
      combined_job_number: job.combined_job_number,
      job_number: job.job_number || "",
      bid_number: job.bid_number || "",
      job_location: job.job_location,
      contractor: job.contractor,
      rate: job.rate || "",
      fringe: job.fringe || "",
      is_rated: job.is_rated || "n",
      start_date: job.start_date || "",
      end_date: job.end_date || "",
      type: job.type,
      office: job.office,
      pm: job.pm?.trim() || "",
      job_status: job.job_status?.trim() || "",
      is_validated: job.is_validated || false,
    }))

    setJobs(jobs)
    calculateValidationIssues(jobs)
  } catch (error) {
    console.error("Failed to fetch real jobs:", error)
  } finally {
    setLoading(false)
  }
}

  function calculateValidationIssues(jobsData: Job[]) {
    const issues: ValidationIssue[] = []

    const missingStartDate = jobsData.filter((job) => !job.start_date || job.start_date.trim() === "")
    if (missingStartDate.length > 0) {
      issues.push({
        field: "start_date",
        label: "Start Date",
        count: missingStartDate.length,
        type: "missing",
        affectedJobs: missingStartDate,
      })
    }

    const missingEndDate = jobsData.filter((job) => !job.end_date || job.end_date.trim() === "")
    if (missingEndDate.length > 0) {
      issues.push({
        field: "end_date",
        label: "End Date",
        count: missingEndDate.length,
        type: "missing",
        affectedJobs: missingEndDate,
      })
    }

    const missingJobStatus = jobsData.filter((job) => !job.job_status || job.job_status.trim() === "")
    if (missingJobStatus.length > 0) {
      issues.push({
        field: "job_status",
        label: "Job Status",
        count: missingJobStatus.length,
        type: "missing",
        affectedJobs: missingJobStatus,
      })
    }

    const missingOffice = jobsData.filter((job) => !job.office || job.office.trim() === "")
    if (missingOffice.length > 0) {
      issues.push({
        field: "office",
        label: "Office",
        count: missingOffice.length,
        type: "missing",
        affectedJobs: missingOffice,
      })
    }

    const missingType = jobsData.filter((job) => !job.type || job.type.trim() === "")
    if (missingType.length > 0) {
      issues.push({
        field: "type",
        label: "Type",
        count: missingType.length,
        type: "missing",
        affectedJobs: missingType,
      })
    }

    const missingPM = jobsData.filter((job) => !job.pm || job.pm.trim() === "")
    if (missingPM.length > 0) {
      issues.push({
        field: "pm",
        label: "Project Manager",
        count: missingPM.length,
        type: "missing",
        affectedJobs: missingPM,
      })
    }

    const invalidRate = jobsData.filter((job) => job.rate && isNaN(Number.parseFloat(job.rate)))
    if (invalidRate.length > 0) {
      issues.push({
        field: "rate",
        label: "Rate",
        count: invalidRate.length,
        type: "invalid",
        affectedJobs: invalidRate,
      })
    }

    const invalidFringe = jobsData.filter((job) => job.fringe && isNaN(Number.parseFloat(job.fringe)))
    if (invalidFringe.length > 0) {
      issues.push({
        field: "fringe",
        label: "Fringe",
        count: invalidFringe.length,
        type: "invalid",
        affectedJobs: invalidFringe,
      })
    }

    const invalidIsRated = jobsData.filter(
      (job) => job.is_rated !== "true" && job.is_rated !== "false" && job.is_rated !== "",
    )
    if (invalidIsRated.length > 0) {
      issues.push({
        field: "is_rated",
        label: "Is Rated",
        count: invalidIsRated.length,
        type: "invalid",
        affectedJobs: invalidIsRated,
      })
    }

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

  const validatedJobsCount =
    jobs.length - new Set(validationIssues.flatMap((issue) => issue.affectedJobs.map((job) => job.id))).size
  const totalJobs = jobs.length

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
              <span className="font-medium text-foreground">{totalJobs}</span> jobs validated
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIssue(null)}
                className="h-6 px-2 text-xs hover:bg-orange-500/10 hover:text-orange-500"
              >
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
