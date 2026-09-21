import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore"

import { db } from "@/lib/firebase"
import type { SalesMockInput, SalesRecord } from "@/features/sales/types"

const SALES_COLLECTION = "sales"

export const MOCK_SALES: SalesMockInput[] = [
  { employee: "Alice", sales: 10, month: 7 },
  { employee: "Bob", sales: 15, month: 7 },
  { employee: "Charlie", sales: 12, month: 7 },
  { employee: "Alice", sales: 8, month: 8 },
  { employee: "Bob", sales: 6, month: 8 },
  { employee: "Charlie", sales: 20, month: 8 },
  { employee: "Alice", sales: 10, month: 9 },
  { employee: "Bob", sales: 15, month: 9 },
  { employee: "Charlie", sales: 7, month: 9 },
  { employee: "Alice", sales: 18, month: 9 },
]

export function subscribeToSales(
  onChange: (records: SalesRecord[]) => void,
  onError?: (error: Error) => void
) {
  const salesQuery = query(
    collection(db, SALES_COLLECTION),
    orderBy("month", "asc")
  )

  return onSnapshot(
    salesQuery,
    (snapshot) => {
      const records = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<SalesRecord, "id">),
      }))
      onChange(records)
    },
    onError
  )
}

export async function seedMockSales() {
  await Promise.all(
    MOCK_SALES.map((record) =>
      addDoc(collection(db, SALES_COLLECTION), {
        ...record,
        createdAt: serverTimestamp(),
      })
    )
  )
}
