# PROMPT

Tôi muốn tạo 1 chức năng quản lý công việc

1. Đường dẫn: workspace/tasks
2. features/workspace/tasks/components để chứa các components
3. features/workspace/tasks/services để chứa các hàm làm việc với firebase firestore

firebase firestore tôi lưu trữ như sau:

1. collection: tasks
2. data schema của task:

- id: auto ID
- title: string
- description: string
- status: To do | In Progress | Done
- priority: Urgent | High | Medium | Low
- createdAt: timestamp
- updatedAt: timestamp

Về UI / UX

1. Dùng shadcnui cho các thành phần nhập liệu và hiển thị dữ liệu
2. Dùng react-table để hiển thị bảng dữ liệu

Cụ thể:

1. Form nhập / sửa: Dùng Dialog
2. tiêu chí status: Combobox, mặc định: To do
3. tiêu chí priority: Combobox, mặc định: Medium

Dữ liệu bắt buộc phải nhập:

- title
- status
- priority

Table hiển thị thứ tự các cột sau:

- id
- title
- description
- status
- priority
- createdAt
- updatedAt

Về màu sắc:
priority:

- Urgent: #531dab
- Hight: #cf1322
- Medium: #389e0d
- Low: #d48806

status:
To do: #d48806
In Progress: #0958d9
Done: #389e0d

---

Sau khi mỗi user đăng nhập thành công bằng Firebase AUTH thì bên firebase firestore có 1 collection users để chứa các thông tin của user đấy, collection này có thêm các thông tin:

1. id của user là dùng uid của auth
2. firstName, lastName, phone

---

Mỗi công việc (task) cần có 1 sub collection:
Có các comments
comment:

- id: auto number
- createdBy: reference đến auth uid
- createdAt: timestamp
- content: string

Cập nhập thêm có tôi 1 cửa sổ để xem / nhập comment, dùng Sheet của shadcnui

---

Phần comment, cho phép người khác reply (comment có parent / child)

---

Collection tasks cần thêm 1 thuộc tính tags là loại dữ liệu array trong firestore:
Ví dụ lưu: "marketing", "phone", "danang"

Dùng Input nhập liệu cho phần tags

---

Hiện nay tôi dùng Firebase Storage để lưu trữ file đính kèm,
Cập nhật tính năng cho phép đính kèm file (cho phép đính kèm nhiều file), upload file folder:

tasks/id của task/attachments/tên file upload lên.ext

ext là phần mở rộng của file
