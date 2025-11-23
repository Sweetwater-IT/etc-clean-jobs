"use client"

import { useState } from "react"
import type { Job } from "@/types/job"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BulkEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobs: Job[]
  column: string
  onSave: (column: string, value: string) => Promise<void>
}

export function BulkEditDialog({ open, onOpenChange, jobs, column, onSave }: BulkEditDialogProps) {
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    await onSave(column, value)
    setLoading(false)
    setValue("")
  }

  const columnLabels: Record<string, string> = {
    office: "Office",
    job_status: "Job Status",
    type: "Type",
    pm: "PM",
    start_date: "Start Date",
    end_date: "End Date",
  }

  const columnOptions: Record<string, string[]> = {
    office: ["Bedford", "Turbotville", "Harrisburg", "Pittsburgh"],
    job_status: ["ON-GOING", "COMPLETE", "PENDING", "CANCELLED"],
    type: ["Public", "Private", "Municipal"],
  }

  const renderInput = () => {
    if (columnOptions[column]) {
      return (
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger>
            <SelectValue placeholder={`Select ${columnLabels[column]}`} />
          </SelectTrigger>
          <SelectContent>
            {columnOptions[column].map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    if (column.includes("date")) {
      return <Input type="date" value={value} onChange={(e) => setValue(e.target.value)} />
    }

    return (
      <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={`Enter ${columnLabels[column]}`} />
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Edit {columnLabels[column]}</DialogTitle>
          <DialogDescription>
            Update {columnLabels[column]} for {jobs.length} selected job{jobs.length !== 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>New {columnLabels[column]} Value</Label>
            {renderInput()}
          </div>

          <div className="rounded-lg border p-4 bg-muted/50">
            <p className="text-sm font-medium mb-2">Affected Jobs:</p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {jobs.slice(0, 10).map((job) => (
                <div key={job.id} className="text-sm text-muted-foreground">
                  {job.job_number} - {job.contractor}
                </div>
              ))}
              {jobs.length > 10 && (
                <div className="text-sm text-muted-foreground italic">...and {jobs.length - 10} more</div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!value || loading} className="bg-orange-500 hover:bg-orange-600">
            {loading ? "Updating..." : `Update ${jobs.length} Job${jobs.length !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
