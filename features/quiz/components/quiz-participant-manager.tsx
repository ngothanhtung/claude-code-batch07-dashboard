"use client"

import { toast } from "sonner"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getUserFullName } from "@/features/users/types"
import type { UserProfile } from "@/features/users/types"
import {
  removeParticipant,
  setParticipant,
} from "@/features/quiz/services/participant-service"
import {
  QUIZ_ROLE_LABELS,
  type QuizParticipant,
  type QuizParticipantRole,
} from "@/features/quiz/types"

const ROLE_OPTIONS = Object.entries(QUIZ_ROLE_LABELS) as [
  QuizParticipantRole,
  string,
][]
const SEAT_OPTIONS = [1, 2, 3, 4]
const UNASSIGNED = "unassigned"

export function QuizParticipantManager({
  users,
  participants,
}: {
  users: UserProfile[]
  participants: QuizParticipant[]
}) {
  function participantFor(uid: string) {
    return participants.find((p) => p.id === uid)
  }

  async function handleRoleChange(user: UserProfile, role: string | null) {
    const displayName = getUserFullName(user) || user.id

    if (!role || role === UNASSIGNED) {
      await removeParticipant(user.id).catch(() =>
        toast.error("Không thể gỡ vai trò.")
      )
      return
    }

    const current = participantFor(user.id)
    try {
      await setParticipant(user.id, {
        role: role as QuizParticipantRole,
        displayName,
        seat: role === "contestant" ? current?.seat : undefined,
      })
    } catch {
      toast.error("Không thể cập nhật vai trò.")
    }
  }

  async function handleSeatChange(user: UserProfile, seat: string | null) {
    const current = participantFor(user.id)
    if (!current || current.role !== "contestant") return

    try {
      await setParticipant(user.id, {
        role: "contestant",
        displayName: current.displayName,
        seat: seat ? Number(seat) : undefined,
      })
    } catch {
      toast.error("Không thể cập nhật vị trí thí sinh.")
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Người dùng</TableHead>
          <TableHead>Vai trò</TableHead>
          <TableHead>Vị trí (thí sinh)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const participant = participantFor(user.id)
          const takenSeats = participants
            .filter((p) => p.role === "contestant" && p.id !== user.id)
            .map((p) => p.seat)

          return (
            <TableRow key={user.id}>
              <TableCell>{getUserFullName(user) || user.id}</TableCell>
              <TableCell>
                <Select
                  value={participant?.role ?? UNASSIGNED}
                  onValueChange={(value) => handleRoleChange(user, value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue>
                      {(value: string | null) =>
                        value && value !== UNASSIGNED
                          ? QUIZ_ROLE_LABELS[value as QuizParticipantRole]
                          : "Chưa phân vai"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNASSIGNED}>Chưa phân vai</SelectItem>
                    {ROLE_OPTIONS.map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                {participant?.role === "contestant" ? (
                  <Select
                    value={participant.seat ? String(participant.seat) : ""}
                    onValueChange={(value) => handleSeatChange(user, value)}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue>
                        {(value: string | null) =>
                          value ? `Thí sinh ${value}` : "Chọn vị trí"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {SEAT_OPTIONS.map((seat) => (
                        <SelectItem
                          key={seat}
                          value={String(seat)}
                          disabled={takenSeats.includes(seat)}
                        >
                          Thí sinh {seat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
