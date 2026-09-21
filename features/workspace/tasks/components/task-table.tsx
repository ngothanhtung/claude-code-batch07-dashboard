"use client"

import * as React from "react"
import { format } from "date-fns"
import {
  MessageSquareIcon,
  MoreHorizontalIcon,
  PaperclipIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react"
import {
  columnVisibilityFeature,
  createColumnHelper,
  FlexRender,
  tableFeatures,
  useTable,
} from "@tanstack/react-table"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  TASK_PRIORITY_COLORS,
  TASK_STATUS_COLORS,
  type Task,
} from "@/features/workspace/tasks/types"
import { getUserFullName, type UserProfile } from "@/features/users/types"

const features = tableFeatures({ columnVisibilityFeature })

const columnHelper = createColumnHelper<typeof features, Task>()

function formatTimestamp(value: string) {
  if (!value) return "—"
  return format(new Date(value), "dd/MM/yyyy HH:mm")
}

function ColorBadge({ label, color }: { label: string; color: string }) {
  return (
    <Badge
      variant="outline"
      className="border-transparent"
      style={{ color, backgroundColor: `${color}1a` }}
    >
      {label}
    </Badge>
  )
}

function buildColumns(
  onEdit: (task: Task) => void,
  onRequestDelete: (task: Task) => void,
  onOpenComments: (task: Task) => void,
  onOpenAttachments: (task: Task) => void,
  assigneeNameById: Map<string, string>
) {
  return columnHelper.columns([
    columnHelper.accessor("id", {
      header: "ID",
      cell: (info) => (
        <span className="font-mono text-xs text-muted-foreground">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("title", {
      header: "Tiêu đề",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor("description", {
      header: "Mô tả",
      cell: (info) => (
        <span className="line-clamp-2 max-w-xs text-muted-foreground">
          {info.getValue() || "—"}
        </span>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Trạng thái",
      cell: (info) => (
        <ColorBadge
          label={info.getValue()}
          color={TASK_STATUS_COLORS[info.getValue()]}
        />
      ),
    }),
    columnHelper.accessor("priority", {
      header: "Độ ưu tiên",
      cell: (info) => (
        <ColorBadge
          label={info.getValue()}
          color={TASK_PRIORITY_COLORS[info.getValue()]}
        />
      ),
    }),
    columnHelper.accessor("assigneeId", {
      header: "Người xử lý",
      cell: (info) => {
        const assigneeId = info.getValue()
        return (
          <span className="text-muted-foreground">
            {assigneeId ? (assigneeNameById.get(assigneeId) ?? "?") : "—"}
          </span>
        )
      },
    }),
    columnHelper.accessor("tags", {
      header: "Tags",
      cell: (info) => {
        const tags = info.getValue()
        return tags.length === 0 ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )
      },
    }),
    columnHelper.accessor("createdAt", {
      header: "Ngày tạo",
      cell: (info) => formatTimestamp(info.getValue()),
    }),
    columnHelper.accessor("updatedAt", {
      header: "Cập nhật",
      cell: (info) => formatTimestamp(info.getValue()),
    }),
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-sm" />}
          >
            <MoreHorizontalIcon />
            <span className="sr-only">Thao tác</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <PencilIcon />
              Sửa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onOpenAttachments(row.original)}>
              <PaperclipIcon />
              Tệp đính kèm
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onOpenComments(row.original)}>
              <MessageSquareIcon />
              Bình luận
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onRequestDelete(row.original)}
            >
              <Trash2Icon />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ])
}

export function TaskTable({
  tasks,
  users,
  isLoading,
  onEdit,
  onDelete,
  onOpenComments,
  onOpenAttachments,
}: {
  tasks: Task[]
  users: UserProfile[]
  isLoading?: boolean
  onEdit: (task: Task) => void
  onDelete: (task: Task) => Promise<void>
  onOpenComments: (task: Task) => void
  onOpenAttachments: (task: Task) => void
}) {
  const [deleteTarget, setDeleteTarget] = React.useState<Task | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const assigneeNameById = React.useMemo(
    () =>
      new Map(users.map((user) => [user.id, getUserFullName(user) || user.id])),
    [users]
  )

  const columns = React.useMemo(
    () =>
      buildColumns(
        onEdit,
        setDeleteTarget,
        onOpenComments,
        onOpenAttachments,
        assigneeNameById
      ),
    [onEdit, onOpenComments, onOpenAttachments, assigneeNameById]
  )

  const table = useTable({
    features,
    data: tasks,
    columns,
    getRowId: (row) => row.id,
  })

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await onDelete(deleteTarget)
      setDeleteTarget(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : (
                    <FlexRender header={header} />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center text-muted-foreground"
              >
                Đang tải dữ liệu...
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center text-muted-foreground"
              >
                Chưa có công việc nào.
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa công việc?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa công việc &quot;{deleteTarget?.title}
              &quot;? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
