import { SalesRealtimeChart } from "@/features/sales/components/sales-realtime-chart"

export default function SalesPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <SalesRealtimeChart />
      </div>
    </div>
  )
}
