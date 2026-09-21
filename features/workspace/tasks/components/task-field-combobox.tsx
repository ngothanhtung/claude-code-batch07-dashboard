"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

export function TaskFieldCombobox<T extends string>({
  id,
  value,
  onValueChange,
  options,
  colors,
}: {
  id?: string
  value: T
  onValueChange: (value: T) => void
  options: readonly T[]
  colors: Record<T, string>
}) {
  return (
    <Combobox
      items={options}
      value={value}
      onValueChange={(next) => {
        if (next) onValueChange(next)
      }}
    >
      <ComboboxInput id={id} readOnly />
      <ComboboxContent>
        <ComboboxEmpty>Không tìm thấy.</ComboboxEmpty>
        <ComboboxList>
          {(item: T) => (
            <ComboboxItem key={item} value={item}>
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: colors[item] }}
              />
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
