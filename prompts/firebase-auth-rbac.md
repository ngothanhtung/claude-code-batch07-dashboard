# Firebase Auth với RBAC

Hệ thống dùng RBAC

trong firebase firesrtore, tôi có collection: roles (id, name), roles-users (id, roleId, userId = uid), users (id = uid, ...)

Quy tắc phân quyền
Ai có role = sale-managers thì:

1. thấy menu: Doanh số và các menu con thuộc nó
2. được phép truy cập (next-auth kiểm soát route) http://localhost:3000/sales

---

Nếu có lỗi logic
---

Tôi đăng nhập thành công uid = Zg9k7AikxiOLb83OIaaZjsyolo22

Trong roles-users có data là:
roleId = sale-managers
userId = Zg9k7AikxiOLb83OIaaZjsyolo22

Nhưng vẫn không thấy menu Doanh số và các menu con thuộc nó
Và vẫn không truy cập được http://localhost:3000/sales
