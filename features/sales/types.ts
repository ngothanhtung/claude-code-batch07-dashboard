export type SalesRecord = {
  id: string
  employee: string
  sales: number
  month: number
}

export type SalesMockInput = Omit<SalesRecord, "id">
