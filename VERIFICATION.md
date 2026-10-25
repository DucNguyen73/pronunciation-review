# Kiểm tra bản bàn giao

Ngày: 2026-10-22. Website local, không triển khai lên mạng.

## Đã kiểm tra

- Node: 4 nhóm kiểm tra đạt: 29 bài, 128 câu hỏi có đáp án hợp lệ, 32 trang PDF được tham chiếu; điều kiện hoàn thành; giữ điểm tốt nhất; lịch ôn 1/3/7 ngày và lọc thẻ chưa mở; xác thực bản sao JSON.
- Chromium thực qua Python Playwright: trang chủ không có hash, điều hướng, tìm kiếm/kết quả trống, học và hoàn thành bài, giữ tiến độ sau tải lại, lật thẻ và lên lịch, lưu và luyện lại câu sai, tải PDF.
- Xuất JSON, hủy xóa, xác nhận xóa, khôi phục bản sao tải xuống và từ chối tệp sai định dạng.
- Kiểm tra thiếu giọng đọc, thiếu API âm thanh và localStorage bị chặn: bài học vẫn dùng được, có thông báo hướng dẫn.
- Kiểm tra lựa chọn giọng en-US mặc định, đổi giọng, tốc độ qua mô phỏng Web Speech API. Máy kiểm tra không có giọng tiếng Anh nên chưa xác nhận chất lượng âm thanh thực tế bằng nghe.
- Kiểm tra liên kết bỏ qua điều hướng bằng bàn phím, giao diện desktop 1440px và mobile 390px. Các màn hình bài học, kiểm tra, thẻ, thư viện, cài đặt và tiến độ không tràn ngang ở kích thước mobile.
- Không có lỗi JavaScript trong lượt kiểm tra tích hợp cuối.

## Giới hạn

Chưa kiểm tra trực tiếp trên Safari, Firefox hoặc thiết bị iOS/Android thật. Giọng hệ thống tùy thiết bị và có thể cần Internet; giọng tổng hợp không đảm bảo thể hiện đầy đủ các biến thể phát âm. Bản trích xuất PDF giữ nội dung nguồn và có thể còn lỗi định dạng; bài tóm tắt có ghi chú về các quy tắc giản lược và ngoại lệ.

## Chạy lại

```bash
node tests/core.test.cjs
python3 -m http.server 8000 --bind 127.0.0.1
# Ở terminal khác, nếu có Python Playwright và /usr/bin/chromium:
python3 tests/browser.py
```

## Kiểm tra sau lượt dùng thử và cải thiện

Đã chạy lại 4 nhóm kiểm tra Node, toàn bộ `tests/browser.py` và `tests/ux-review.py`. Cả ba lượt đạt. Thử tiếp tục đúng câu và feedback sau khi xem bài học; kiểm tra nút nghe 70 × 44 px, bài học mobile ưu tiên quy tắc, ngày ôn tiếp, chuyển câu đưa nội dung vào màn hình và nhận focus. 24 tổ hợp trang/viewport ở 320, 390, 768, 1366 px không tràn ngang. Ảnh chụp trước/sau và giới hạn đánh giá được lưu ở `audit/index.html` và `AUDIT.md`.
