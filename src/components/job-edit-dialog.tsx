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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSave(formData)
    setSaving(false)
  }

  const updateField = (field: keyof Job, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const isHighlighted = (field: string) => field === highlightField

  const fieldRow = (field: keyof Job, label: string, current: string, input: React.ReactNode) => (
    <div className={`space-y-2 ${isHighlighted(field) ? "ring-2 ring-orange-400 rounded-lg p-4 bg-orange-50" : ""}`}>
      <Label className="text-base font-semibold">{label}</Label>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Current</p>
          <div className="p-3 bg-muted rounded-md text-sm font-mono min-h-[44px] flex items-center">
            {current || <span className="text-red-500">— empty —</span>}
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">New</p>
          {input}
        </div>
      </div>
    </div>
  )

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job #{job.combined_job_number || job.id}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid gap-6">
            {fieldRow("job_number", "Job Number", job.combined_job_number || "", <Input value={formData.combined_job_number || ""} disabled />)}
            {fieldRow("bid_number", "Bid Number", job.bid_number || "", <Input value={formData.bid_number || ""} onChange={e => updateField("bid_number", e.target.value)} />)}
            {fieldRow("job_location", "Job Location", job.job_location, <Textarea rows={2} value={formData.job_location} onChange={e => updateField("job_location", e.target.value)} />)}
            {fieldRow("contractor", "Contractor", job.contractor, <Input value={formData.contractor} onChange={e => updateField("contractor", e.target.value)} />)}

            {fieldRow("rate", "Rate", job.rate || "", <Input type="number" step="0.01" value={formData.rate || ""} onChange={e => updateField("rate", e.target.value)} />)}
            {fieldRow("fringe", "Fringe", job.fringe || "", <Input type="number" step="0.01" value={formData.fringe || ""} onChange={e => updateField("fringe", e.target.value)} />)}

            {fieldRow("is_rated", "Is Rated", job.is_rated === "y" ? "Yes" : "No", (
              <Select value={formData.is_rated === "y" ? "y" : "n"} onValueChange={v => updateField("is_rated", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="y">Yes</SelectItem>
                  <SelectItem value="n">No</SelectItem>
                </SelectContent>
              </Select>
            ))}

            {fieldRow("start_date", "Start Date", job.start_date || "", <Input type="date" value={formData.start_date || ""} onChange={e => updateField("start_date", e.target.value)} />)}
            {fieldRow("end_date", "End Date", job.end_date || "", <Input type="date" value={formData.end_date || ""} onChange={e => updateField("end_date", e.target.value)} />)}

            {fieldRow("type", "Type", job.type, (
              <Select value={formData.type} onValueChange={v => updateField("type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            ))}

            {fieldRow("office", "Office", job.office, (
              <Select value={formData.office} onValueChange={v => updateField("office", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hatfield">Hatfield</SelectItem>
                  <SelectItem value="bedford">Bedford</SelectItem>
                  <SelectItem value="turbotville">Turbotville</SelectItem>
                </SelectContent>
              </Select>
            ))}

            {fieldRow("pm", "Project Manager", job.pm, (
              <Select value={formData.pm} onValueChange={v => updateField("pm", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="John Nelson">John Nelson</SelectItem>
                  <SelectItem value="Larry Long">Larry Long</SelectItem>
                  <SelectItem value="Richard Gresh">Richard Gresh</SelectItem>
                  <SelectItem value="Jim Redden">Jim Redden</SelectItem>
                </SelectContent>
              </Select>
            ))}

            {fieldRow("job_status", "Job Status", job.job_status, (
              <Select value={formData.job_status} onValueChange={v => updateField("job_status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="not started">Not Started</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                </SelectContent>
              </Select>
            ))}
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
