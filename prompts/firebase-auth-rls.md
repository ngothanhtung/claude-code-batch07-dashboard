# Firebase Auth với RLS (Row-Level Security)

Tôi có một hệ thống sử dụng Firebase Auth và muốn triển khai RLS (Row-Level Security) để kiểm soát quyền truy cập dữ liệu dựa trên người dùng.

Áp dụng cho tasks (collection)

assignee: ref: users/{userId}

1. Ai cũng có thể tạo task mới sau khi đăng nhập.
2. Chỉ người dùng được gán trong trường assignee mới có quyền truy cập vào task đó.
3. Chỉ người dùng được gán trong trường assignee mới có quyền edit task đó.
4. Chỉ người dùng được gán trong trường assignee mới có quyền delete task đó.

---

Trong firebase firestore, tôi có data như hình (chụp màn hình tasks trong firebase)

Nhưng khi vào http://localhost:3000/workspace/tasks thì không thấy công việc của user này

---

Vẫn chưa thấy data, lưu ý field: assignee là kiểu ref đến users/id

---

task có thêm 1 field (thuộc tính) 1 người theo dõi (follower), kiểu ref đến users/id

Với field follower này, chỉ những người dùng được gán trong trường follower mới có quyền xem task đó.

Có quyền bình luận về task đó.

Không có quyền chỉnh sửa hoặc xóa task đó.
