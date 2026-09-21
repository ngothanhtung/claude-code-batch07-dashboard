"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { getUserFullName, type UserProfile } from "@/features/users/types"

export function TaskAssigneeCombobox({
  id,
  value,
  onValueChange,
  users,
}: {
  id?: string
  value: string | null
  onValueChange: (value: string | null) => void
  users: UserProfile[]
}) {
  const items = users.map((user) => ({
    value: user.id,
    label: getUserFullName(user) || user.id,
  }))
  const selected = items.find((item) => item.value === value) ?? null

  return (
    <Combobox
      items={items}
      value={selected}
      isItemEqualToValue={(item, other) => item.value === other.value}
      onValueChange={(next) => onValueChange(next ? next.value : null)}
    >
      <ComboboxInput id={id} readOnly placeholder="Chưa gán" showClear />
      <ComboboxContent>
        <ComboboxEmpty>Không có người dùng nào.</ComboboxEmpty>
        <ComboboxList>
          {(item: { value: string; label: string }) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
