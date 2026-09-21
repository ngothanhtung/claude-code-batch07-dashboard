# Ứng dụng chat theo nhóm với Firebase Firestore realtime

Tôi xây ứng dụng chat (firebase firestore realtime) theo nhóm (room), có data schema sau:
chat-rooms/{roomId}
├── name: string
├── createdAt: timestamp
└── updatedAt: timestamp

chat-rooms/{roomId}/messages/{messageId}
├── text: string
├── senderId: string (auth uid)
├── senderName: string
├── senderPhotoURL: string | null
├── createdAt: timestamp
└── updatedAt: timestamp

Tạo một ứng dụng chat đơn giản bằng Next.js và Firebase Firestore realtime:

Yêu cầu:

- Trang /chat hiển thị danh sách phòng chat (collection chat-rooms)
- Trang /chat/[roomId] hiển thị tin nhắn theo thời gian thực từ subcollection messages
- Người dùng phải đăng nhập (Firebase Auth) mới có thể xem và gửi tin nhắn
- Form gửi tin nhắn ở dưới cùng, tin nhắn mới tự động hiện lên đầu danh sách
- Mỗi tin nhắn hiển thị: tên người gửi, nội dung, thời gian
- Tự động cuộn xuống tin nhắn mới nhất
- Dùng shadcn/ui cho giao diện (Input, Button, Card, Avatar)

---

Tạo cho tôi màn hình CRUD chat rooms

---

Nâng cấp ứng dụng chat cho phép đính kèm hình ảnh trong tin nhắn.
Dùng firebase storage để lưu trữ hình ảnh và lưu URL
