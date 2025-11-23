"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, AlertTriangle, ChevronRight } from "lucide-react"
import type { ValidationIssue } from "@/types/job"

interface ValidationIssueCardProps {
  issue: ValidationIssue
  onClick: () => void
  isSelected: boolean
}

export function ValidationIssueCard({ issue, onClick, isSelected }: ValidationIssueCardProps) {
  const isCritical = issue.count > 3

  return (
    <Card
      className={`p-3 cursor-pointer transition-all hover:shadow-md hover:border-foreground/20 ${
        isSelected ? "ring-2 ring-primary shadow-md border-primary" : "border-border"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={`p-1.5 rounded-md shrink-0 ${
              isCritical ? "bg-red-100 dark:bg-red-900/30" : "bg-amber-100 dark:bg-amber-900/30"
            }`}
          >
            {isCritical ? (
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-semibold text-sm truncate">{issue.label}</h3>
              <Badge
                variant={isCritical ? "destructive" : "secondary"}
                className="text-[10px] px-1.5 py-0 h-4 shrink-0"
              >
                {issue.type === "missing" ? "Missing" : "Invalid"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{issue.count}</span>{" "}
              {issue.count === 1 ? "record needs" : "records need"} correction
            </p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </div>
    </Card>
  )
}
