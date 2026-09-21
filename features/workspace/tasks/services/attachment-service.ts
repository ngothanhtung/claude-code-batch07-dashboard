import {
  deleteObject,
  getDownloadURL,
  getMetadata,
  listAll,
  ref,
  uploadBytes,
} from "firebase/storage"

import { storage } from "@/lib/firebase"
import type { TaskAttachment } from "@/features/workspace/tasks/types"

const TASKS_FOLDER = "tasks"
const ATTACHMENTS_FOLDER = "attachments"

function attachmentsFolderRef(taskId: string) {
  return ref(storage, `${TASKS_FOLDER}/${taskId}/${ATTACHMENTS_FOLDER}`)
}

function attachmentRef(taskId: string, fileName: string) {
  return ref(storage, `${TASKS_FOLDER}/${taskId}/${ATTACHMENTS_FOLDER}/${fileName}`)
}

export async function listAttachments(taskId: string): Promise<TaskAttachment[]> {
  const result = await listAll(attachmentsFolderRef(taskId))
  return Promise.all(
    result.items.map(async (item) => {
      const [url, metadata] = await Promise.all([
        getDownloadURL(item),
        getMetadata(item),
      ])
      return {
        name: item.name,
        url,
        size: metadata.size,
        contentType: metadata.contentType ?? null,
      } satisfies TaskAttachment
    })
  )
}

export async function uploadAttachments(taskId: string, files: File[]) {
  await Promise.all(
    files.map((file) => uploadBytes(attachmentRef(taskId, file.name), file))
  )
}

export async function deleteAttachment(taskId: string, fileName: string) {
  await deleteObject(attachmentRef(taskId, fileName))
}
