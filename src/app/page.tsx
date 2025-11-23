import { JobCleaningDashboard } from "@/components/job-cleaning-dashboard"

export default function JobCleaningPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-[1400px]">
        <JobCleaningDashboard />
      </div>
    </main>
  )
}
