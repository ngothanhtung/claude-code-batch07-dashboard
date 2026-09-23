# Sử dụng Firebase Auth với Next-Auth

Hệ thống dùng Google Firebase Auth
Thiết lập quy tắc Authentication:

1. Các trang: login (/login), home (/) là không cần Authenticated
2. Các trang còn lại thuộc layout DASHBOARD thì cần Authenticated

Nếu user chưa đăng nhập thì phải chuyển về /login

Dùng next-auth + firebase auth

- firebase auth dùng để kiểm tra đăng nhập
- next-auth dùng để kiểm soát đường dẫn

---

Khi chưa đăng nhập thì nếu tôi cố vào dashboard thì bị chuyển về login: ĐÚNG

Nhưng sau khi thoát ra (Logout) thì nếu tôi cố vào dashboard vẫn được: SAI
