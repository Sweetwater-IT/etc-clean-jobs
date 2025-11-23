// src/components/job-edit-dialog.tsx
"use client"

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

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Job Number */}
            <div className={isHighlighted("job_number") ? "ring-2 ring-orange-500 rounded-lg p-4" : ""}>
              <Label>Job Number</Label>
              <Input value={formData.combined_job_number || ""} disabled />
            </div>

            {/* PM */}
            <div className={isHighlighted("pm") ? "ring-2 ring-orange-500 rounded-lg p-4" : ""}>
              <Label>Project Manager</Label>
              <Select value={formData.pm} onValueChange={(v) => updateField("pm", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="John Nelson">John Nelson</SelectItem>
                  <SelectItem value="Larry Long">Larry Long</SelectItem>
                  <SelectItem value="Richard Gresh">Richard Gresh</SelectItem>
                  <SelectItem value="Jim Redden">Jim Redden</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Office */}
            <div className={isHighlighted("office") ? "ring-2 ring-orange-500 rounded-lg p-4" : ""}>
              <Label>Office</Label>
              <Select value={formData.office} onValueChange={(v) => updateField("office", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hatfield">Hatfield</SelectItem>
                  <SelectItem value="bedford">Bedford</SelectItem>
                  <SelectItem value="turbotville">Turbotville</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type */}
            <div className={isHighlighted("type") ? "ring-2 ring-orange-500 rounded-lg p-4" : ""}>
              <Label>Type</Label>
              <Select value={formData.type} onValueChange={(v) => updateField("type", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Job Status */}
            <div className={isHighlighted("job_status") ? "ring-2 ring-orange-500 rounded-lg p-4" : ""}>
              <Label>Job Status</Label>
              <Select value={formData.job_status} onValueChange={(v) => updateField("job_status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="not started">Not Started</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rate */}
            <div className={isHighlighted("rate") ? "ring-2 ring-orange-500 rounded-lg p-4" : ""}>
              <Label>Rate</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.rate || ""}
                onChange={(e) => updateField("rate", e.target.value)}
              />
            </div>

            {/* Fringe */}
            <div className={isHighlighted("fringe") ? "ring-2 ring-orange-500 rounded-lg p-4" : ""}>
              <Label>Fringe</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.fringe || ""}
                onChange={(e) => updateField("fringe", e.target.value)}
              />
            </div>

            {/* Start Date */}
            <div className={isHighlighted("start_date") ? "ring-2 ring-orange-500 rounded-lg p-4" : ""}>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={formData.start_date || ""}
                onChange={(e) => updateField("start_date", e.target.value)}
              />
            </div>

            {/* End Date */}
            <div className={isHighlighted("end_date") ? "ring-2 ring-orange-500 rounded-lg p-4" : ""}>
              <Label>End Date</Label>
              <Input
                type="date"
                value={formData.end_date || ""}
                onChange={(e) => updateField("end_date", e.target.value)}
              />
            </div>
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