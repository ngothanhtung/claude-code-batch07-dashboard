"use client"

import * as React from "react"
import { format } from "date-fns"
import { XIcon } from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import {
  createComment,
  subscribeComments,
} from "@/features/workspace/tasks/services/comment-service"
import type { Task, TaskComment } from "@/features/workspace/tasks/types"
import { getUserFullName, type UserProfile } from "@/features/users/types"

function formatTimestamp(value: string) {
  if (!value) return ""
  return format(new Date(value), "dd/MM/yyyy HH:mm")
}

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?"
  )
}

function CommentNode({
  comment,
  childrenByParent,
  authorName,
  onReply,
  depth = 0,
}: {
  comment: TaskComment
  childrenByParent: Map<string | null, TaskComment[]>
  authorName: (uid: string) => string
  onReply: (comment: TaskComment) => void
  depth?: number
}) {
  const replies = childrenByParent.get(comment.id) ?? []

  return (
    <div className={depth > 0 ? "mt-3 ml-4 border-l pl-3" : ""}>
      <div className="flex gap-3">
        <Avatar size="sm">
          <AvatarFallback>{getInitials(authorName(comment.createdBy))}</AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-col gap-0.5">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium">
              {authorName(comment.createdBy)}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTimestamp(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
          <Button
            type="button"
            variant="link"
            className="h-auto w-fit p-0 text-xs text-muted-foreground"
            onClick={() => onReply(comment)}
          >
            Trả lời
          </Button>
        </div>
      </div>
      {replies.map((reply) => (
        <CommentNode
          key={reply.id}
          comment={reply}
          childrenByParent={childrenByParent}
          authorName={authorName}
          onReply={onReply}
          depth={depth + 1}
        />
      ))}
    </div>
  )
}

export function TaskCommentsSheet({
  open,
  onOpenChange,
  task,
  users,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  users: UserProfile[]
}) {
  const { user } = useAuth()
  const [comments, setComments] = React.useState<TaskComment[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [content, setContent] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [replyTarget, setReplyTarget] = React.useState<TaskComment | null>(null)

  const userById = React.useMemo(
    () => new Map(users.map((u) => [u.id, u])),
    [users]
  )

  const childrenByParent = React.useMemo(() => {
    const map = new Map<string | null, TaskComment[]>()
    for (const comment of comments) {
      const siblings = map.get(comment.parentId) ?? []
      siblings.push(comment)
      map.set(comment.parentId, siblings)
    }
    return map
  }, [comments])

  const rootComments = childrenByParent.get(null) ?? []

  React.useEffect(() => {
    if (!open || !task) {
      setComments([])
      return
    }
    setIsLoading(true)
    setContent("")
    setReplyTarget(null)
    const unsubscribe = subscribeComments(
      task.id,
      (data) => {
        setComments(data)
        setIsLoading(false)
      },
      () => {
        toast.error("Không thể tải bình luận.")
        setIsLoading(false)
      }
    )
    return unsubscribe
  }, [open, task])

  function authorName(uid: string) {
    const author = userById.get(uid)
    return author ? getUserFullName(author) || uid : uid
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!task || !user || !content.trim()) return
    setIsSubmitting(true)
    try {
      await createComment(
        task.id,
        user.uid,
        content.trim(),
        replyTarget?.id ?? null
      )
      setContent("")
      setReplyTarget(null)
    } catch {
      toast.error("Không thể gửi bình luận.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Bình luận</SheetTitle>
          <SheetDescription>{task?.title}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Đang tải...</p>
          ) : rootComments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có bình luận nào.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {rootComments.map((comment) => (
                <CommentNode
                  key={comment.id}
                  comment={comment}
                  childrenByParent={childrenByParent}
                  authorName={authorName}
                  onReply={setReplyTarget}
                />
              ))}
            </div>
          )}
        </div>
        <SheetFooter>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            {replyTarget && (
              <div className="flex items-center justify-between rounded-md bg-muted px-2.5 py-1.5 text-xs">
                <span className="text-muted-foreground">
                  Đang trả lời{" "}
                  <span className="font-medium text-foreground">
                    {authorName(replyTarget.createdBy)}
                  </span>
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setReplyTarget(null)}
                >
                  <XIcon />
                  <span className="sr-only">Hủy trả lời</span>
                </Button>
              </div>
            )}
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                user ? "Nhập bình luận..." : "Bạn cần đăng nhập để bình luận."
              }
              disabled={!user}
            />
            <Button
              type="submit"
              disabled={!user || !content.trim() || isSubmitting}
            >
              {isSubmitting ? "Đang gửi..." : "Gửi bình luận"}
            </Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
