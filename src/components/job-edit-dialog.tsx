"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import type { Job } from "@/types/job"

interface JobEditDialogProps {
  job: Job
  onClose: () => void
  onSave: (job: Job) => Promise<void>
  highlightField?: string
}

export function JobEditDialog({ job, onClose, onSave, highlightField }: JobEditDialogProps) {
  const [formData, setFormData] = useState<Job>(job)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSave(formData)
    setSaving(false)
  }

  function updateField(field: keyof Job, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const isHighlighted = (field: string) => field === highlightField

  function renderFieldComparison(field: keyof Job, label: string, inputElement: React.ReactNode, currentValue: string) {
    return (
      <div
        className={`space-y-2 ${isHighlighted(field) ? "p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900" : ""}`}
      >
        <Label>{label}</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Current</p>
            <div className="p-2 bg-muted rounded-md text-sm min-h-[40px] flex items-center">
              {currentValue || <span className="text-destructive">Empty</span>}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">New</p>
            {inputElement}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 py-4">
            {/* Job Number */}
            {renderFieldComparison(
              "job_number",
              "Job Number",
              <Input
                id="job_number"
                value={formData.job_number}
                onChange={(e) => updateField("job_number", e.target.value)}
              />,
              job.job_number,
            )}

            {/* Bid Number */}
            {renderFieldComparison(
              "bid_number",
              "Bid Number",
              <Input
                id="bid_number"
                value={formData.bid_number}
                onChange={(e) => updateField("bid_number", e.target.value)}
              />,
              job.bid_number,
            )}

            {/* Job Location */}
            {renderFieldComparison(
              "job_location",
              "Job Location",
              <Textarea
                id="job_location"
                value={formData.job_location}
                onChange={(e) => updateField("job_location", e.target.value)}
                rows={2}
              />,
              job.job_location,
            )}

            {/* Contractor */}
            {renderFieldComparison(
              "contractor",
              "Contractor",
              <Input
                id="contractor"
                value={formData.contractor}
                onChange={(e) => updateField("contractor", e.target.value)}
              />,
              job.contractor,
            )}

            {/* Rate */}
            {renderFieldComparison(
              "rate",
              "Rate",
              <Input
                id="rate"
                type="number"
                step="0.01"
                value={formData.rate}
                onChange={(e) => updateField("rate", e.target.value)}
                placeholder="Enter rate"
              />,
              job.rate,
            )}

            {/* Fringe */}
            {renderFieldComparison(
              "fringe",
              "Fringe",
              <Input
                id="fringe"
                type="number"
                step="0.01"
                value={formData.fringe}
                onChange={(e) => updateField("fringe", e.target.value)}
                placeholder="Enter fringe"
              />,
              job.fringe,
            )}

            {/* Is Rated */}
            {renderFieldComparison(
              "is_rated",
              "Is Rated",
              <Select value={formData.is_rated} onValueChange={(value) => updateField("is_rated", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">True</SelectItem>
                  <SelectItem value="false">False</SelectItem>
                </SelectContent>
              </Select>,
              job.is_rated,
            )}

            {/* Start Date */}
            {renderFieldComparison(
              "start_date",
              "Start Date",
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => updateField("start_date", e.target.value)}
              />,
              job.start_date,
            )}

            {/* End Date */}
            {renderFieldComparison(
              "end_date",
              "End Date",
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => updateField("end_date", e.target.value)}
              />,
              job.end_date,
            )}

            {/* Type */}
            {renderFieldComparison(
              "type",
              "Type",
              <Select value={formData.type} onValueChange={(value) => updateField("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Public">Public</SelectItem>
                  <SelectItem value="Private">Private</SelectItem>
                </SelectContent>
              </Select>,
              job.type,
            )}

            {/* Office */}
            {renderFieldComparison(
              "office",
              "Office",
              <Input id="office" value={formData.office} onChange={(e) => updateField("office", e.target.value)} />,
              job.office,
            )}

            {/* PM */}
            {renderFieldComparison(
              "pm",
              "PM",
              <Input id="pm" value={formData.pm} onChange={(e) => updateField("pm", e.target.value)} />,
              job.pm,
            )}

            {/* Job Status */}
            {renderFieldComparison(
              "job_status",
              "Job Status",
              <Select value={formData.job_status} onValueChange={(value) => updateField("job_status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ON-GOING">On-Going</SelectItem>
                  <SelectItem value="COMPLETE">Complete</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>,
              job.job_status,
            )}

            {/* Sign Status */}
            {renderFieldComparison(
              "sign_status",
              "Sign Status",
              <Input
                id="sign_status"
                value={formData.sign_status}
                onChange={(e) => updateField("sign_status", e.target.value)}
              />,
              job.sign_status,
            )}

            {/* Remarks */}
            {renderFieldComparison(
              "remarks",
              "Remarks",
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) => updateField("remarks", e.target.value)}
                rows={3}
              />,
              job.remarks,
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
