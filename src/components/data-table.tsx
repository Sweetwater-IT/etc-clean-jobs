"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, Edit, ChevronDown } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRowClick?: (row: TData) => void
  onBulkEdit?: (rows: TData[], column: string) => void
  onExport?: (rows: TData[]) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  onBulkEdit,
  onExport,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [allRowsSelected, setAllRowsSelected] = React.useState(false)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const hasSelection = selectedRows.length > 0
  const totalRows = table.getFilteredRowModel().rows.length

  const showSelectAllButton = hasSelection && !allRowsSelected && totalRows > selectedRows.length

  const handleSelectAllRows = () => {
    table.toggleAllRowsSelected(true)
    setAllRowsSelected(true)
  }

  React.useEffect(() => {
    if (selectedRows.length === 0) {
      setAllRowsSelected(false)
    }
  }, [selectedRows.length])

  const handleExport = () => {
    const selectedData = selectedRows.map((row) => row.original)
    if (onExport) {
      onExport(selectedData)
    } else {
      const csv = convertToCSV(selectedData)
      downloadCSV(csv, "selected-jobs.csv")
    }
  }

  const handleBulkEdit = (column: string) => {
    const selectedData = selectedRows.map((row) => row.original)
    onBulkEdit?.(selectedData, column)
  }

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return ""
    const headers = Object.keys(data[0])
    const csvRows = [headers.join(",")]
    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header]
        return typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value
      })
      csvRows.push(values.join(","))
    }
    return csvRows.join("\n")
  }

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.setAttribute("hidden", "")
    a.setAttribute("href", url)
    a.setAttribute("download", filename)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const editableColumns = [
    { key: "office", label: "Office" },
    { key: "job_status", label: "Job Status" },
    { key: "type", label: "Type" },
    { key: "pm", label: "PM" },
    { key: "start_date", label: "Start Date" },
    { key: "end_date", label: "End Date" },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {hasSelection && (
            <>
              {showSelectAllButton && (
                <Button
                  variant="link"
                  onClick={handleSelectAllRows}
                  className="text-black hover:text-black/80 px-0 h-auto font-normal underline"
                >
                  Select all rows in table ({totalRows})
                </Button>
              )}

              {/* Bulk Edit Column button with dropdown menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-black text-white hover:bg-black/90 border-black font-medium">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {editableColumns.map((col) => (
                    <DropdownMenuItem key={col.key} onClick={() => handleBulkEdit(col.key)}>
                      {col.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          <Input
            placeholder="Filter by job number..."
            value={(table.getColumn("job_number")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("job_number")?.setFilterValue(event.target.value)}
            className="max-w-sm"
          />
          <Input
            placeholder="Filter by contractor..."
            value={(table.getColumn("contractor")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("contractor")?.setFilterValue(event.target.value)}
            className="max-w-sm"
          />
        </div>
        {hasSelection && (
          <Button onClick={handleExport} className="bg-orange-500 hover:bg-orange-600 text-white font-medium">
            <Download className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>
        )}
      </div>

      <div className="rounded-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50 border-b-2 border-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-muted/50">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-semibold">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.id !== "select" ? "cursor-pointer" : ""}
                      onClick={(e) => {
                        if (cell.column.id !== "select") {
                          onRowClick?.(row.original)
                        }
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <span className="mr-4 font-medium">
              {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
              selected
            </span>
          )}
          {table.getFilteredRowModel().rows.length} of {data.length} row(s) shown
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
