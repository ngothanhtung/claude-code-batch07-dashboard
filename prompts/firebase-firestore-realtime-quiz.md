# Ứng dụng QUIZ cho sân khấu (stage)

Tôi muốn làm 1 ứng dụng QUIZ cho sân khấu (stage)
Có 4 thí sinh (đăng nhập bằng Auth UID)
Có 1 màn hình LED để khán giả xem, thí sinh cũng có thể thấy nội dung câu hỏi.
Có 1 màn hình dành cho MC, giám khảo (giống nhau)
Có 1 màn hình dành cho đạo diễn sân khấu (điều khiển hiển thị các câu hỏi & đáp án)

Question data schema:
questions (Làm mock data 10 question về từ vựng Tiếng Anh)

- id: auto id,
- content
- answerOptions: array
- correctOption: text,
- score: số nguyên

answers:

- id: auto id,
- userId: auth UID
- questionId,
- option
- isCorrect: yes / no

Tham khảo hình đính kèm:
