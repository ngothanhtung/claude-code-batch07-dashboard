"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { seedMockSales, subscribeToSales } from "@/features/sales/services/sales-service"
import type { SalesRecord } from "@/features/sales/types"

const MAX_SERIES = 5
const OTHER_KEY = "khac"

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

type ChartRow = { month: number } & Record<string, number>

function buildChartData(records: SalesRecord[]): {
  rows: ChartRow[]
  config: ChartConfig
} {
  const sorted = [...records].sort((a, b) => a.month - b.month)

  const totalsByEmployee = new Map<string, number>()
  const firstSeenOrder: string[] = []
  for (const record of sorted) {
    if (!totalsByEmployee.has(record.employee)) {
      firstSeenOrder.push(record.employee)
    }
    totalsByEmployee.set(
      record.employee,
      (totalsByEmployee.get(record.employee) ?? 0) + record.sales
    )
  }

  const topEmployees = [...firstSeenOrder]
    .sort((a, b) => (totalsByEmployee.get(b) ?? 0) - (totalsByEmployee.get(a) ?? 0))
    .slice(0, MAX_SERIES)
  const topEmployeeSet = new Set(topEmployees)
  const hasOther = firstSeenOrder.length > topEmployees.length

  const seriesKeys = [...topEmployees, ...(hasOther ? [OTHER_KEY] : [])]

  const config: ChartConfig = {}
  seriesKeys.forEach((key, index) => {
    config[key] = {
      label: key === OTHER_KEY ? "Khác" : key,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }
  })

  const rowsByMonth = new Map<number, ChartRow>()
  for (const record of sorted) {
    const key = topEmployeeSet.has(record.employee) ? record.employee : OTHER_KEY
    const row =
      rowsByMonth.get(record.month) ?? ({ month: record.month } as ChartRow)
    row[key] = (row[key] ?? 0) + record.sales
    rowsByMonth.set(record.month, row)
  }

  const rows = [...rowsByMonth.values()].sort((a, b) => a.month - b.month)

  return { rows, config }
}

export function SalesRealtimeChart() {
  const [records, setRecords] = React.useState<SalesRecord[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const [seeding, setSeeding] = React.useState(false)

  React.useEffect(() => {
    const unsubscribe = subscribeToSales(
      (next) => setRecords(next),
      (err) => setError(err.message)
    )
    return () => unsubscribe()
  }, [])

  const { rows, config } = React.useMemo(() => buildChartData(records), [records])
  const seriesKeys = React.useMemo(() => Object.keys(config), [config])

  async function handleSeed() {
    setSeeding(true)
    setError(null)
    try {
      await seedMockSales()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo dữ liệu mẫu")
    } finally {
      setSeeding(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Doanh số nhân viên theo thời gian thực</CardTitle>
        <CardDescription>
          Doanh số theo tháng của từng nhân viên, cập nhật trực tiếp từ Firestore
        </CardDescription>
        <CardAction>
          <Button size="sm" variant="outline" onClick={handleSeed} disabled={seeding}>
            {seeding ? "Đang tạo..." : "Tạo dữ liệu mẫu"}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-destructive text-sm">{error}</p>
        ) : rows.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Chưa có dữ liệu doanh số. Nhấn &quot;Tạo dữ liệu mẫu&quot; để bắt đầu.
          </p>
        ) : (
          <ChartContainer config={config} className="aspect-auto h-[320px] w-full">
            <BarChart data={rows} margin={{ left: 12, right: 12 }} barGap={4} barCategoryGap="20%">
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value: number) => `Tháng ${value}`}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} width={40} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => `Tháng ${value}`}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              {seriesKeys.map((key) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={`var(--color-${key})`}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
