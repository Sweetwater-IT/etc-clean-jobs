"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Job } from "@/types/job"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowUpDown } from "lucide-react"

export const columns: ColumnDef<Job>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="border-muted-foreground"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "combined_job_number",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Job #
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("combined_job_number")}</div>,
  },
  {
    accessorKey: "job_location",
    header: "Location",
    cell: ({ row }) => {
      const location = row.getValue("job_location") as string
      const contractor = row.original.contractor
      return (
        <div className="max-w-[280px]">
          <div className="truncate" title={location}>
            {location || "—"}
          </div>
          {contractor && <div className="text-xs text-red-600 font-medium mt-0.5">Contractor: {contractor}</div>}
        </div>
      )
    },
  },
  {
    accessorKey: "pm",
    header: "Project Manager",
    cell: ({ row }) => {
      const value = row.getValue("pm") as string
      return <div className="text-sm">{value || "—"}</div>
    },
  },
  {
    accessorKey: "rate",
    header: "Rate",
    cell: ({ row }) => {
      const rate = row.original.rate
      const rateNum = rate ? Number.parseFloat(rate) : null
      return <div className="text-sm">{rateNum && !isNaN(rateNum) ? `$${rateNum.toFixed(2)}` : "—"}</div>
    },
  },
  {
    accessorKey: "fringe",
    header: "Fringe",
    cell: ({ row }) => {
      const fringe = row.original.fringe
      const fringeNum = fringe ? Number.parseFloat(fringe) : null
      return <div className="text-sm">{fringeNum && !isNaN(fringeNum) ? `$${fringeNum.toFixed(2)}` : "—"}</div>
    },
  },
  {
    accessorKey: "start_date",
    header: "Start",
    cell: ({ row }) => {
      const value = row.getValue("start_date") as string
      return <div className={!value ? "text-destructive font-medium" : "text-sm"}>{value || "Missing"}</div>
    },
  },
  {
    accessorKey: "end_date",
    header: "End",
    cell: ({ row }) => {
      const value = row.getValue("end_date") as string
      return <div className={!value ? "text-destructive font-medium" : "text-sm"}>{value || "Missing"}</div>
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const value = row.getValue("type") as string
      return <div className="text-sm">{value || "—"}</div>
    },
  },
  {
    accessorKey: "office",
    header: "Office",
    cell: ({ row }) => {
      const value = row.getValue("office") as string
      return <div className="text-sm">{value || "—"}</div>
    },
  },
  {
    accessorKey: "job_status",
    header: "Status",
    cell: ({ row }) => {
      const value = row.getValue("job_status") as string

      if (!value) {
        return <div className="text-sm text-red-600 font-medium">Missing</div>
      }

      let badgeClass = "text-xs bg-slate-100 text-slate-800 hover:bg-slate-100"
      if (value === "COMPLETE") badgeClass = "text-xs bg-red-100 text-red-800 hover:bg-red-100"
      else if (value === "ON-GOING") badgeClass = "text-xs bg-green-100 text-green-800 hover:bg-green-100"
      else if (value === "NOT STARTED") badgeClass = "text-xs bg-slate-100 text-slate-800 hover:bg-slate-100"

      return (
        <Badge variant="outline" className={badgeClass}>
          {value}
        </Badge>
      )
    },
  },
]
